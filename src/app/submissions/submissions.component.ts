import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { SubmissionService } from '../services/submission.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

interface Submission {
  id: string;
  problem_id: string;
  problem_title: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Error';
  runtime: string;
  memory: string;
  submitted_at: string;
  code: string;
  
}

@Component({
  selector: 'app-submissions',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './submissions.component.html',
  styleUrls: ['./submissions.component.css']
})
export class SubmissionsComponent implements OnInit, OnDestroy {
  user: any | null = null;
  submissions: Submission[] = [];
  date: any;
  loading: boolean = true;
  error: string | null = null;
  private userSubscription: Subscription | undefined;
  private submissionsSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private submissionService: SubmissionService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        this.fetchSubmissions();
      } else {
        this.submissions = [];
        this.loading = false;
        this.error = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.submissionsSubscription?.unsubscribe();
  }

  fetchSubmissions(): void {
    if (!this.user) {
      this.loading = false;
      return;
    }
    this.loading = true;
    this.error = null;
    this.submissionsSubscription = this.submissionService.getSubmissionsByUserId(this.user.id).subscribe({
      next: (data) => {
        this.submissions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching submissions:', err);
        this.error = 'Failed to load submissions. Please try again.';
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Wrong Answer':
        return 'bg-red-100 text-red-800';
      case 'Time Limit Exceeded':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
