import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientFormComponent } from './client-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClientService } from '../../services/client.service';
import { UserService } from '../../../users/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { Client } from '../../models/client.model';
import { User } from '../../../users/models/user.model';

describe('ClientFormComponent', () => {
  let component: ClientFormComponent;
  let fixture: ComponentFixture<ClientFormComponent>;
  let clientService: jasmine.SpyObj<ClientService>;
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockUser: User = { id: 1, name: 'user1', email: 'test@gmail.com' };
  const mockClient: Client = {
    id: 1,
    surnom: 'client1',
    idUser: 1,
    userName: 'user1',
    user: mockUser
  };

  beforeEach(async () => {
    const clientSpy = jasmine.createSpyObj('ClientService', ['create', 'update']);
    const userSpy = jasmine.createSpyObj('UserService', ['getAll']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCardModule,
        BrowserAnimationsModule,
        ClientFormComponent
      ],
      providers: [
        { provide: ClientService, useValue: clientSpy },
        { provide: UserService, useValue: userSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: undefined } },
            data: of({ client: undefined })
          }
        }
      ]
    }).compileComponents();

    clientService = TestBed.inject(ClientService) as jasmine.SpyObj<ClientService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    userService.getAll.and.returnValue(of([mockUser]));
    router.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit form and navigate in create mode', () => {
    clientService.create.and.returnValue(of(mockClient));
    component.clientForm.setValue({ surnom: 'client1', user_id: 1 });

    component.onSubmit();

    expect(clientService.create).toHaveBeenCalledWith(
      jasmine.objectContaining({ surnom: 'client1', user_id: 1 } as any)
    );

    expect(router.navigate).toHaveBeenCalledWith(['/client']);
  });

  it('should submit form and navigate in edit mode', () => {
    component.isEditMode = true;
    component.clientId = 1;
    clientService.update.and.returnValue(of(mockClient));

    component.clientForm.setValue({ surnom: 'client_updated', user_id: 1 });
    component.onSubmit();

    expect(clientService.update).toHaveBeenCalledWith(
      1,
      jasmine.objectContaining({ surnom: 'client_updated', user_id: 1 } as any)
    );
    expect(router.navigate).toHaveBeenCalledWith(['/client']);
  });



  it('should show error snackbar when API fails', () => {
    clientService.create.and.returnValue(throwError(() => ({ message: 'Erreur Serveur' })));
    component.clientForm.setValue({ surnom: 'client1', user_id: 1 });

    component.onSubmit();

    expect(snackBar.open).toHaveBeenCalledWith('Erreur Serveur', 'Fermer', jasmine.any(Object));
  });
});
