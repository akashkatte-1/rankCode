import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Problem { // Exported to be used by other components/services
  id: string;
  title: string;
  slug: string;
  description: string;
  input_format: string;
  output_format: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  created_by: string;
  sample_input?: string;
  sample_output?: string;
  test_cases?: { input: string; expected_output: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class ProblemService {
  private mockProblems: Problem[] = [
    {
      id: 'prob101',
      title: 'Two Sum',
      slug: 'two-sum',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\n**Example 1:**\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n```\n**Example 2:**\n```\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]\n```',
      input_format: '`nums`: number[], `target`: number',
      output_format: 'number[]',
      difficulty: 'Easy',
      tags: ['Array', 'Hash Table'],
      created_by: 'Admin',
      sample_input: 'nums = [2,7,11,15]\ntarget = 9',
      sample_output: '[0,1]',
      test_cases: [
        { input: '[2,7,11,15]\n9', expected_output: '[0,1]' },
        { input: '[3,2,4]\n6', expected_output: '[1,2]' },
        { input: '[3,3]\n6', expected_output: '[0,1]' },
      ]
    },
    {
      id: 'prob102',
      title: 'Reverse String',
      slug: 'reverse-string',
      description: 'Write a function that reverses a string. The input string is given as an array of characters `char[]`. You must do this by modifying the input array in-place with $O(1)$ extra memory.\n\n**Example 1:**\n```\nInput: ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]\n```',
      input_format: '`s`: char[]',
      output_format: 'char[]',
      difficulty: 'Easy',
      tags: ['String', 'Two Pointers'],
      created_by: 'Admin',
      sample_input: '["h","e","l","l","o"]',
      sample_output: '["o","l","l","e","h"]',
      test_cases: [
        { input: '["h","e","l","l","o"]', expected_output: '["o","l","l","e","h"]' },
        { input: '["a","b","c"]', expected_output: '["c","b","a"]' },
      ]
    },
    {
      id: 'prob103',
      title: 'Palindrome Check',
      slug: 'palindrome-check',
      description: 'Given a string `s`, return `true` if it is a palindrome, `false` otherwise. Consider only alphanumeric characters and ignore cases.\n\n**Example 1:**\n```\nInput: "A man, a plan, a canal: Panama"\nOutput: true\nExplanation: "amanaplanacanalpanama" is a palindrome.\n```',
      input_format: '`s`: string',
      output_format: 'boolean',
      difficulty: 'Easy',
      tags: ['String'],
      created_by: 'Admin',
      sample_input: '"A man, a plan, a canal: Panama"',
      sample_output: 'true',
      test_cases: [
        { input: '"A man, a plan, a canal: Panama"', expected_output: 'true' },
        { input: '"race a car"', expected_output: 'false' },
      ]
    },
    {
      id: 'prob201',
      title: 'Longest Substring Without Repeating Characters',
      slug: 'longest-substring-without-repeating-characters',
      description: 'Given a string `s`, find the length of the longest substring without repeating characters.\n\n**Example 1:**\n```\nInput: "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.\n```',
      input_format: '`s`: string',
      output_format: 'number',
      difficulty: 'Medium',
      tags: ['String', 'Sliding Window'],
      created_by: 'Admin',
      sample_input: '"abcabcbb"',
      sample_output: '3',
      test_cases: [
        { input: '"abcabcbb"', expected_output: '3' },
        { input: '"bbbbb"', expected_output: '1' },
      ]
    },
    {
      id: 'prob202',
      title: 'Add Two Numbers',
      slug: 'add-two-numbers',
      description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.\n\n**Example 1:**\n```\nInput: l1 = [2,4,3], l2 = [5,6,4]\nOutput: [7,0,8]\nExplanation: 342 + 465 = 807.\n```',
      input_format: '`l1`: ListNode, `l2`: ListNode',
      output_format: 'ListNode',
      difficulty: 'Medium',
      tags: ['Linked List', 'Math'],
      created_by: 'Admin',
      sample_input: 'l1 = [2,4,3]\nl2 = [5,6,4]',
      sample_output: '[7,0,8]',
      test_cases: [
        { input: '[2,4,3]\n[5,6,4]', expected_output: '[7,0,8]' },
        { input: '[0]\n[0]', expected_output: '[0]' },
      ]
    },
    {
      id: 'prob203',
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[`, and `]`, determine if the input string is valid.\n\n**Example 1:**\n```\nInput: "()"\nOutput: true\n```',
      input_format: '`s`: string',
      output_format: 'boolean',
      difficulty: 'Medium',
      tags: ['String', 'Stack'],
      created_by: 'Admin',
      sample_input: '"()"',
      sample_output: 'true',
      test_cases: [
        { input: '"()"', expected_output: 'true' },
        { input: '"()[]{}"', expected_output: 'true' },
      ]
    },
    {
      id: 'prob301',
      title: 'Median of Two Sorted Arrays',
      slug: 'median-of-two-sorted-arrays',
      description: 'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays. The overall run time complexity should be $O(\log(m+n))$',
      input_format: '`nums1`: number[], `nums2`: number[]',
      output_format: 'number',
      difficulty: 'Hard',
      tags: ['Array', 'Binary Search', 'Divide and Conquer'],
      created_by: 'Admin',
      sample_input: 'nums1 = [1,3]\nnums2 = [2]',
      sample_output: '2.0',
      test_cases: [
        { input: '[1,3]\n[2]', expected_output: '2.0' },
        { input: '[1,2]\n[3,4]', expected_output: '2.5' },
      ]
    },
    {
      id: 'prob302',
      title: 'Longest Valid Parentheses',
      slug: 'longest-valid-parentheses',
      description: 'Given a string containing just the characters `(` and `)`, find the length of the longest valid (well-formed) parentheses substring.\n\n**Example 1:**\n```\nInput: "(()"\nOutput: 2\nExplanation: The longest valid parentheses substring is "()".\n```',
      input_format: '`s`: string',
      output_format: 'number',
      difficulty: 'Hard',
      tags: ['String', 'Dynamic Programming', 'Stack'],
      created_by: 'Admin',
      sample_input: '"(()"',
      sample_output: '2',
      test_cases: [
        { input: '"(()"', expected_output: '2' },
        { input: '")()())"', expected_output: '4' },
      ]
    },
  ];

  getProblems(): Observable<Problem[]> {
    return of(this.mockProblems).pipe(delay(1000)); // Simulate API delay
  }

  getProblemById(id: string): Observable<Problem | undefined> {
    const problem = this.mockProblems.find(p => p.id === id);
    return of(problem).pipe(delay(800)); // Simulate API delay
  }
}
