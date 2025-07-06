import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { SubmissionsComponent } from './submissions/submissions.component';
import { AdminComponent } from './admin/admin.component';
import { ProblemsComponent } from './problems/problems.component';
import { ProblemDetailComponent } from './problem-detail/problem-detail.component';

export const routes: Routes = [
    {path:'login',component:LoginComponent},
    {path:'register',component:RegisterComponent},
    {path:'home',component:HomeComponent},
    {path:'profile',component:ProfileComponent},
    {path:'submission',component:SubmissionsComponent},
    {path:'admin',component:AdminComponent},
    {path:'problems',component:ProblemsComponent},
    {path:'problem-detail',component:ProblemDetailComponent},
    
    {path:'',redirectTo:'/login',pathMatch:'full'}
];
