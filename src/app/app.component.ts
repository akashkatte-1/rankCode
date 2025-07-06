import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { AdminComponent } from './admin/admin.component';
import { SubmissionsComponent } from './submissions/submissions.component';
import { ProblemDetailComponent } from './problem-detail/problem-detail.component';
import { ProblemsComponent } from './problems/problems.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'CodePlatform';
  currentPage: string = 'home'; // Default page
  selectedProblemId: string | null = null;

  ngOnInit(): void {
    // Optionally set a default page or read from URL if using router
    this.currentPage = 'problems'; // Start on the problems page
  }

  setCurrentPageHandler(page: any): void {
    this.currentPage = page;
    this.selectedProblemId = null; // Clear selected problem when navigating to a different page
  }

  setSelectedProblemIdHandler(problemId: any): void {
    this.selectedProblemId = problemId;
  }
}