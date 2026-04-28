import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // SidebarComponent est standalone, donc il va dans imports
      imports: [SidebarComponent],
      providers: [
        provideHttpClient(),        // Règle l'erreur No provider for HttpClient
        provideHttpClientTesting(), // Pour simuler les appels API si besoin
        provideRouter([])           // Nécessaire si la sidebar contient des routerLink
      ]
    })
      .compileComponents(); // transforme code TypeScript, ton HTML et CSS en une version exécutable par le navigateur de test.

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
