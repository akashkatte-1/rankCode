import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone:true,
  imports:[FormsModule,CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: any | null = null;
  editMode: boolean = false;
  formData: { username: string; email: string } = { username: '', email: '' };
  message: string = '';
  messageType: 'success' | 'error' | '' = '';
  private userSubscription: Subscription | undefined;

  constructor(private authService: AuthService,private router:Router) {}
  login(): void{
    this.router.navigate(['/login']);
  }
  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        this.formData = { username: user.username, email: user.email };
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  setEditMode(mode: boolean): void {
    this.editMode = mode;
    this.message = ''; 
  }

  cancelEdit(): void {
    this.setEditMode(false);
    if (this.user) {
      this.formData = { username: this.user.username, email: this.user.email };
    }
  }

  handleSave(): void {
    this.message = '';
    this.messageType = '';
    this.authService.updateProfile(this.formData).subscribe({
      next: (updatedUser) => {
        if (updatedUser) {
          this.message = 'Profile updated successfully!';
          this.messageType = 'success';
          this.setEditMode(false);
        } else {
          this.message = 'Failed to update profile. User not found.';
          this.messageType = 'error';
        }
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.message = 'Failed to update profile. Please try again.';
        this.messageType = 'error';
      }
    });
  }
}
