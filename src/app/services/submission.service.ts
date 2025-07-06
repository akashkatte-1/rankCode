import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private mockSubmissions: Submission[] = [
    {
      id: 'sub001',
      problem_id: 'prob101',
      problem_title: 'Two Sum',
      language: 'Python',
      status: 'Accepted',
      runtime: '45ms',
      memory: '12MB',
      submitted_at: '2023-10-26T10:30:00Z',
      code: 'def twoSum(nums, target):\n    # ... code ...',
    },
    {
      id: 'sub002',
      problem_id: 'prob102',
      problem_title: 'Reverse String',
      language: 'JavaScript',
      status: 'Wrong Answer',
      runtime: '30ms',
      memory: '10MB',
      submitted_at: '2023-10-25T14:15:00Z',
      code: 'function reverseString(s) {\n    // ... code ...\n}',
    },
    {
      id: 'sub003',
      problem_id: 'prob101',
      problem_title: 'Two Sum',
      language: 'Java',
      status: 'Time Limit Exceeded',
      runtime: '2000ms',
      memory: '30MB',
      submitted_at: '2023-10-24T09:00:00Z',
      code: 'class Solution {\n    // ... code ...\n}',
    },
    {
      id: 'sub004',
      problem_id: 'prob103',
      problem_title: 'Palindrome Check',
      language: 'Python',
      status: 'Accepted',
      runtime: '50ms',
      memory: '15MB',
      submitted_at: '2023-10-23T11:45:00Z',
      code: 'def isPalindrome(s):\n    # ... code ...',
    },
  ];

  getSubmissionsByUserId(userId: string): Observable<Submission[]> {
    // In a real app, you'd filter by userId from the backend
    return of(this.mockSubmissions).pipe(delay(1500)); // Simulate API delay
  }

  runCode(code: string, language: string, input: string): Observable<any> {
    // Simulate compiler API call
    return of({
      output: 'Simulated output based on your code and input.',
      status: 'Success',
      runtime: `${Math.floor(Math.random() * 100) + 20}ms`,
      memory: `${Math.floor(Math.random() * 20) + 10}MB`,
    }).pipe(delay(2000)); // Simulate execution time
  }

  submitCode(userId: string, problemId: string, problemTitle: string, code: string, language: string): Observable<Submission> {
    // Simulate full submission with test cases
    const statusOptions = ['Accepted', 'Wrong Answer', 'Time Limit Exceeded'];
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];

    const newSubmission: Submission = {
      id: `sub${Math.random().toString(36).substr(2, 9)}`,
      problem_id: problemId,
      problem_title: problemTitle,
      language: language,
      status: randomStatus as any, // Cast to avoid type error with random string
      runtime: `${Math.floor(Math.random() * 200) + 50}ms`,
      memory: `${Math.floor(Math.random() * 50) + 20}MB`,
      submitted_at: new Date().toISOString(),
      code: code,
    };
    this.mockSubmissions.unshift(newSubmission); // Add to mock data
    return of(newSubmission).pipe(delay(3000)); // Simulate submission processing time
  }
}
