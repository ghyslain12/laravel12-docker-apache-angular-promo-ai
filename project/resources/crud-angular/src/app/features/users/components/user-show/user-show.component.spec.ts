import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserShowComponent } from './user-show.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import {User} from '../../models/user.model';

describe('UserShowComponent', () => {
  let component: UserShowComponent;
  let fixture: ComponentFixture<UserShowComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: User = { id: 1, name: 'user1', email: 'test@gmail.com' };

  beforeEach(async () => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        UserShowComponent,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ user: mockUser })
          }
        },
        { provide: Router, useValue: routerSpyObj }
      ]
    }).compileComponents();

    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize user from resolver', () => {
    expect(component.user).toEqual(mockUser);
  });

  it('should display user designation in template', () => {
    const designationElement = fixture.nativeElement.querySelector('p');
    expect(designationElement.textContent).toContain('Nom  user1');
  });

  it('should navigate back to user list', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/user']);
  });
});
