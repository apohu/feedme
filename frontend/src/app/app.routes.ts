import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RecipesComponent } from './components/recipes/recipes.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { MenuSuggestionComponent } from './components/menu-suggestion/menu-suggestion.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'recipes', component: RecipesComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'menu-suggestion', component: MenuSuggestionComponent },
  { path: '**', redirectTo: '' }
];
