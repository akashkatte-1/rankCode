import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ProblemService, Problem } from '../services/problem.service'; // Adjust path
import { SubmissionService } from '../services/submission.service'; // Adjust path
import { AuthService } from '../services/auth.service'; // Adjust path
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { MarkdownToHtmlPipe } from '../pipes/markdown-to-html.pipe'; // Import the pipe

@Component({
  standalone: true, // Mark as standalone
  imports: [CommonModule, FormsModule,MarkdownToHtmlPipe], // Import CommonModule, FormsModule, and the pipe
  selector: 'app-problem-detail',
  templateUrl: './problem-detail.component.html',
  styleUrls: ['./problem-detail.component.css']
})
export class ProblemDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() problemId: string | null = null;
  @Output() setCurrentPage = new EventEmitter<string>();

  problem: Problem | undefined;
  loading: boolean = true;
  error: string | null = null;
  user: any | null = null;

  // Code Editor Properties
  userCode: string = '';
  selectedLanguage: string = 'python';
  inputTestCase: string = '';
  outputResult: string = '';
  executionStatus: 'idle' | 'running' | 'success' | 'error' = 'idle';
  submissionStatus: 'idle' | 'submitting' | 'submitted' | 'failed' = 'idle';

  private problemSubscription: Subscription | undefined;
  private userSubscription: Subscription | undefined;
  private submissionSubscription: Subscription | undefined;

  constructor(
    private problemService: ProblemService,
    private submissionService: SubmissionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['problemId'] && this.problemId) {
      this.fetchProblemDetails(this.problemId);
    }
  }

  ngOnDestroy(): void {
    this.problemSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
    this.submissionSubscription?.unsubscribe();
  }

  fetchProblemDetails(id: string): void {
    this.loading = true;
    this.error = null;
    this.problem = undefined; // Clear previous problem details
    this.problemSubscription = this.problemService.getProblemById(id).subscribe({
      next: (data) => {
        this.problem = data;
        // Pre-fill user code with a basic template for the selected language
        this.userCode = this.getLanguageTemplate(this.selectedLanguage);
        // Pre-fill input with sample if available
        if (this.problem?.sample_input) {
          this.inputTestCase = this.problem.sample_input;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching problem details:', err);
        this.error = 'Failed to load problem details. Please try again.';
        this.loading = false;
      }
    });
  }

  getLanguageTemplate(language: string): string {
    switch (language) {
      case 'python':
        return `# Python solution\ndef solve():\n    # Write your code here\n    pass\n\n# Example usage:\n# print(solve())`;
      case 'java':
        return `// Java solution\nclass Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`;
      case 'javascript':
        return `// Javascript solution\nfunction solve() {\n  // Write your code here\n}\n\n// Example usage:\n// console.log(solve());`;
      default:
        return '// Select a language and start coding!';
    }
  }

  onLanguageChange(): void {
    this.userCode = this.getLanguageTemplate(this.selectedLanguage);
  }

  runCode(): void {
    if (!this.userCode || !this.selectedLanguage) {
      this.outputResult = 'Please enter code and select a language.';
      this.executionStatus = 'error';
      return;
    }

    this.executionStatus = 'running';
    this.outputResult = 'Running code...';

    // Simulate code execution
    this.submissionSubscription = this.submissionService.runCode(this.userCode, this.selectedLanguage, this.inputTestCase).subscribe({
      next: (result) => {
        this.outputResult = `Status: ${result.status}\nRuntime: ${result.runtime}\nMemory: ${result.memory}\n\nOutput:\n${result.output}`;
        this.executionStatus = 'success';
      },
      error: (err) => {
        console.error('Code execution failed:', err);
        this.outputResult = 'Error during code execution. Please check your code and try again.';
        this.executionStatus = 'error';
      }
    });
  }

  submitCode(): void {
    if (!this.user) {
      alert('You must be logged in to submit code.');
      this.setCurrentPage.emit('login'); // Redirect to login
      return;
    }

    if (!this.problem || !this.problem.id) {
      alert('Problem not loaded. Cannot submit.');
      return;
    }

    if (!this.userCode || !this.selectedLanguage) {
      alert('Please enter code and select a language before submitting.');
      return;
    }

    this.submissionStatus = 'submitting';
    this.outputResult = 'Submitting code...';

    // Simulate code submission
    this.submissionSubscription = this.submissionService.submitCode(
      this.user.id,
      this.problem.id,
      this.problem.title,
      this.userCode,
      this.selectedLanguage
    ).subscribe({
      next: (submission) => {
        this.outputResult = `Submission Successful! Status: ${submission.status}\nRuntime: ${submission.runtime}\nMemory: ${submission.memory}`;
        this.submissionStatus = 'submitted';
        alert('Submission successful!');
        this.setCurrentPage.emit('submissions'); // Navigate to submissions page after successful submission
      },
      error: (err) => {
        console.error('Code submission failed:', err);
        this.outputResult = 'Error during code submission. Please try again.';
        this.submissionStatus = 'failed';
        alert('Submission failed!');
      }
    });
  }

  // Helper to get difficulty class
  getDifficultyClass(difficulty: string): string {
    switch (difficulty) {
      case 'Easy': return 'difficulty-easy';
      case 'Medium': return 'difficulty-medium';
      case 'Hard': return 'difficulty-hard';
      default: return '';
    }
  }

  goToProblems(): void {
    this.setCurrentPage.emit('problems');
  }
}