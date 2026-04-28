import { UserComponent } from './user.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { User } from '../../models/user.model';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  const mockUsers: User[] = [
    { id: 1, name: 'user1', email: 'test@gmail.com' },
    { id: 2, name: 'user2', email: 'test2@gmail.com' }
  ];

  const userServiceMock = {
    delete: jasmine.createSpy('delete').and.returnValue(of({}))
  };

  const dialogMock = {
    open: jasmine.createSpy('open').and.returnValue({
      afterClosed: () => of(true)
    })
  };

  const snackBarMock = {
    open: jasmine.createSpy('open')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UserComponent,
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: userServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        {
          provide: ActivatedRoute,
          useValue: { data: of({ users: mockUsers }) }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with users from resolver', () => {
    expect(component.dataSource.data.length).toBe(2);
    expect(component.dataSource.data).toEqual(mockUsers);
  });

  it('should display user in table', async () => {
    component.dataSource.data = mockUsers;
    fixture.detectChanges();
    await fixture.whenStable();

    const tableRows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(tableRows.length).toBe(2);

    const firstRowText = tableRows[0].textContent;
    expect(firstRowText).toContain('1');
    expect(firstRowText).toContain('user1');
    expect(firstRowText).toContain('test@gmail.com');
  });

  it('should filter users when applyFilter is called', () => {
    const event = { target: { value: 'user2' } } as unknown as Event;
    component.applyFilter(event);

    expect(component.dataSource.filter).toBe('user2');
    expect(component.dataSource.filteredData.length).toBe(1);
  });
});
