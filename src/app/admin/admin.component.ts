import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProblemService, Problem } from '../services/problem.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 

@Component({
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  problems: Problem[] = [];
  loading: boolean = true;
  error: string | null = null;
  newProblem: Partial<Problem> = {
    title: '',
    description: '',
    input_format: '',
    output_format: '',
    difficulty: 'Easy',
    tags: [],
    sample_input: '',
    sample_output: '',
    created_by: 'Admin'
  };
  tagInput: string = '';
  editProblemId: string | null = null;
  editedProblem: Partial<Problem> | null = null;

  private problemsSubscription: Subscription | undefined;

  constructor(private problemService: ProblemService) {}

  ngOnInit(): void {
    this.fetchProblems();
  }

  ngOnDestroy(): void {
    this.problemsSubscription?.unsubscribe();
  }

  fetchProblems(): void {
    this.loading = true;
    this.error = null;
    this.problemsSubscription = this.problemService.getProblems().subscribe({
      next: (data) => {
        this.problems = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching problems:', err);
        this.error = 'Failed to load problems. Please try again.';
        this.loading = false;
      }
    });
  }

  addTag(): void {
    if (this.tagInput && !this.newProblem.tags?.includes(this.tagInput.trim())) {
      this.newProblem.tags?.push(this.tagInput.trim());
      this.tagInput = '';
    }
  }

  removeTag(tag: string): void {
    this.newProblem.tags = this.newProblem.tags?.filter(t => t !== tag);
  }

  addProblem(): void {
    if (!this.newProblem.title || !this.newProblem.description || !this.newProblem.difficulty) {
      alert('Please fill in all required fields (Title, Description, Difficulty).');
      return;
    }

    const problemToAdd: Problem = {
      ...this.newProblem as Problem,
      id: 'prob' + (this.problems.length + 101), 
      slug: this.newProblem.title?.toLowerCase().replace(/\s+/g, '-') || '',
      tags: this.newProblem.tags || [],
      created_by: 'Admin' 
    };

    this.problems.push(problemToAdd);
    alert('Problem added successfully!');
    this.resetNewProblemForm();
  }

  resetNewProblemForm(): void {
    this.newProblem = {
      title: '',
      description: '',
      input_format: '',
      output_format: '',
      difficulty: 'Easy',
      tags: [],
      sample_input: '',
      sample_output: '',
      created_by: 'Admin'
    };
    this.tagInput = '';
  }

  startEdit(problem: Problem): void {
    this.editProblemId = problem.id;
    this.editedProblem = { ...problem }; 
    this.tagInput = ''; 
  }

  cancelEdit(): void {
    this.editProblemId = null;
    this.editedProblem = null;
    this.tagInput = '';
  }

  addEditTag(): void {
    if (this.tagInput && this.editedProblem?.tags && !this.editedProblem.tags.includes(this.tagInput.trim())) {
      this.editedProblem.tags.push(this.tagInput.trim());
      this.tagInput = '';
    }
  }

  removeEditTag(tag: string): void {
    if (this.editedProblem?.tags) {
      this.editedProblem.tags = this.editedProblem.tags.filter(t => t !== tag);
    }
  }

  saveEdit(): void {
    if (!this.editedProblem?.title || !this.editedProblem?.description || !this.editedProblem?.difficulty) {
      alert('Please fill in all required fields (Title, Description, Difficulty) for the edited problem.');
      return;
    }

    const index = this.problems.findIndex(p => p.id === this.editedProblem?.id);
    if (index !== -1) {
      this.problems[index] = {
        ...this.editedProblem as Problem,
        slug: this.editedProblem.title?.toLowerCase().replace(/\s+/g, '-') || this.problems[index].slug 
      };
      alert('Problem updated successfully!');
      this.cancelEdit();
    } else {
      alert('Error: Problem not found for editing.');
    }
  }

  deleteProblem(id: string): void {
    if (confirm('Are you sure you want to delete this problem?')) {
      this.problems = this.problems.filter(p => p.id !== id);
      alert('Problem deleted successfully!');
    }
  }
}