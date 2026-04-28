import {ComponentFixture, TestBed} from '@angular/core/testing';
import { AppComponent } from './app.component';
import {provideRouter} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render header', () => {
    const headerElement = fixture.nativeElement.querySelector('h1');
    expect(headerElement.textContent).toBe('Logo');
  });

  it('should render footer', () => {
    const footerElement = fixture.nativeElement.querySelector('footer');
    expect(footerElement.textContent).toBe('© 2025 - footer');
  });

  it('should render sidebar', () => {
    const asideElement = fixture.nativeElement.querySelector('aside.sidebar');
    expect(asideElement).toBeTruthy();

    const sidebarElement = asideElement.querySelector('app-sidebar');
    expect(sidebarElement).toBeTruthy();
  });

  it('should render main content', () => {
    const mainElement = fixture.nativeElement.querySelector('main.main');
    expect(mainElement).toBeTruthy();

    const routerOutletElement = mainElement.querySelector('router-outlet');
    expect(routerOutletElement).toBeTruthy();
  });
});

