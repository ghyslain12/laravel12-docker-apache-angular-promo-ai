import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientShowComponent } from './client-show.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import {Client} from '../../models/client.model';
import {User} from '../../../users/models/user.model';

describe('ClientShowComponent', () => {
  let component: ClientShowComponent;
  let fixture: ComponentFixture<ClientShowComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: User = { id: 1, name: 'user1', email: 'test@gmail.com' };
  const mockClient: Client = { id: 1, surnom: 'client1',  idUser: 1, userName: 'user1', user: mockUser };

  beforeEach(async () => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        ClientShowComponent,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ client: mockClient }) // Mock des données du resolver
          }
        },
        { provide: Router, useValue: routerSpyObj }
      ]
    }).compileComponents();

    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize client from resolver', () => {
    expect(component.client).toEqual(mockClient);
  });

  it('should display client designation in template', () => {
    const designationElement = fixture.nativeElement.querySelector('p');
    expect(designationElement.textContent).toContain('Surnom  client1');
  });

  it('should navigate back to client list', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/client']);
  });
});
