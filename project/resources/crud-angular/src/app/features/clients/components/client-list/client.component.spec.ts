import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientComponent } from './client.component';
import { Client } from '../../models/client.model';
import { User } from '../../../users/models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientService } from '../../services/client.service';

describe('ClientComponent', () => {
  let component: ClientComponent;
  let fixture: ComponentFixture<ClientComponent>;
  let router: jasmine.SpyObj<Router>;
  let clientService: jasmine.SpyObj<ClientService>;

  const mockUser: User = { id: 1, name: 'user1', email: 'test@gmail.com' };
  const mockClients: Client[] = [
    { id: 1, surnom: 'client1', idUser: 1, userName: 'user1', user: mockUser },
    { id: 2, surnom: 'client2', idUser: 2, userName: 'user2', user: mockUser }
  ];

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const clientSpy = jasmine.createSpyObj('ClientService', ['delete']);

    await TestBed.configureTestingModule({
      imports: [
        ClientComponent,
        MatDialogModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: ClientService, useValue: clientSpy },
        {
          provide: ActivatedRoute,
          useValue: { data: of({ clients: mockClients }) }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    clientService = TestBed.inject(ClientService) as jasmine.SpyObj<ClientService>;
    router.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Déclenche ngOnInit et ngAfterViewInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize dataSource with clients from resolver', () => {
    expect(component.dataSource.data.length).toBe(2);
    expect(component.dataSource.data).toEqual(mockClients);
  });

  it('should display clients in the material table', () => {
    const tableRows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(tableRows.length).toBe(2);

    const firstRowText = tableRows[0].textContent;
    expect(firstRowText).toContain('client1');
    expect(firstRowText).toContain('user1');
  });

  it('should navigate to edit page', () => {
    component.editClient(mockClients[0]);
    expect(router.navigate).toHaveBeenCalledWith(['/client/edit', 1]);
  });

  it('should filter data', () => {
    const event = { target: { value: 'client2' } } as any;
    component.applyFilter(event);

    expect(component.dataSource.filteredData.length).toBe(1);
    expect(component.dataSource.filteredData[0].surnom).toBe('client2');
  });

  it('should navigate to add page on goToAddUser', () => {
    component.goToAddUser();
    expect(router.navigate).toHaveBeenCalledWith(['/client/add']);
  });
});
