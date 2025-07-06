import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ProblemService } from '../services/problem.service';
import { Problem } from '../services/problem.service'; // Assuming Problem interface is exported
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  standalone: true, // Mark as standalone
  imports: [CommonModule, FormsModule], // Import CommonModule and FormsModule
  selector: 'app-problems',
  templateUrl: './problems.component.html',
  styleUrls: ['./problems.component.css']
})
export class ProblemsComponent implements OnInit {
  @Output() setCurrentPage = new EventEmitter<string>();
  @Output() setSelectedProblemId = new EventEmitter<string>();

  problems: Problem[] = [];
  loading: boolean = true;
  error: string | null = null;
  filters = { difficulty: 'All', tag: 'All', search: '' };
  currentPageNum: number = 1;
  problemsPerPage: number = 5;
  allTags: string[] = [];

  constructor(private problemService: ProblemService) {}

  ngOnInit(): void {
    this.fetchProblems();
  }

  fetchProblems(): void {
    this.loading = true;
    this.error = null;
    this.problemService.getProblems().subscribe({
      next: (data) => {
        this.problems = data;
        this.allTags = [...new Set(data.flatMap(p => p.tags))];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching problems:', err);
        this.error = 'Failed to load problems. Please try again.';
        this.loading = false;
      }
    });
  }

  handleFilterChange(): void {
    this.currentPageNum = 1; // Reset to first page on filter change
  }

  get filteredProblems(): Problem[] {
    return this.problems.filter((problem) => {
      const matchesDifficulty = this.filters.difficulty === 'All' || problem.difficulty === this.filters.difficulty;
      const matchesTag = this.filters.tag === 'All' || problem.tags.includes(this.filters.tag);
      const matchesSearch = problem.title.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                            problem.description.toLowerCase().includes(this.filters.search.toLowerCase());
      return matchesDifficulty && matchesTag && matchesSearch;
    });
  }

  get currentProblems(): Problem[] {
    const indexOfLastProblem = this.currentPageNum * this.problemsPerPage;
    const indexOfFirstProblem = indexOfLastProblem - this.problemsPerPage;
    return this.filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProblems.length / this.problemsPerPage);
  }

  paginate(pageNumber: number): void {
    this.currentPageNum = pageNumber;
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Easy':
        return 'status-easy';
      case 'Medium':
        return 'status-medium';
      case 'Hard':
        return 'status-hard';
      default:
        return 'status-default';
    }
  }

  solveProblem(problemId: string): void {
    this.setSelectedProblemId.emit(problemId);
    this.setCurrentPage.emit('problem-detail');
  }
}