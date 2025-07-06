// src/app/pages/register/register.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Import HttpClient for API calls
import { AuthService } from '../services/auth.service'; // Import the AuthService
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone:true,
  imports:[FormsModule,CommonModule,RouterLink],
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = ''; // To display registration errors

  // Canvas properties (reused from login component)
  @ViewChild('backgroundCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private particles: any[] = [];
  private numberOfParticles = 80;
  private maxDistance = 120;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient // Inject HttpClient
  ) { }

  ngOnInit(): void {
    // Optional: If user is already logged in, redirect them away from register page
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']); // Or '/problems'
    }
  }

  ngAfterViewInit(): void {
    // Initialize canvas after the view has been initialized
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.setCanvasDimensions();
    this.initParticles();
    this.animateCanvas();
  }

  /**
   * Handles window resize events to adjust canvas dimensions.
   * @param event The resize event.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.setCanvasDimensions();
    this.initParticles(); // Re-initialize particles on resize for better distribution
  }

  /**
   * Sets the canvas dimensions to match the window size.
   */
  private setCanvasDimensions(): void {
    this.canvas.nativeElement.width = window.innerWidth;
    this.canvas.nativeElement.height = window.innerHeight;
  }

  /**
   * Initializes the array of particles with random positions, velocities, and radii.
   */
  private initParticles(): void {
    this.particles = [];
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.nativeElement.width,
        y: Math.random() * this.canvas.nativeElement.height,
        vx: (Math.random() - 0.5) * 1, // Small random velocity
        vy: (Math.random() - 0.5) * 1,
        radius: Math.random() * 1.5 + 0.5 // Small random radius
      });
    }
  }

  /**
   * Draws all particles on the canvas.
   */
  private drawParticles(): void {
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height); // Clear canvas for each frame
    this.ctx.fillStyle = '#6b21a8'; // Purple dots

    this.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  /**
   * Updates the position of each particle and handles boundary collisions.
   */
  private updateParticles(): void {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x + p.radius > this.canvas.nativeElement.width || p.x - p.radius < 0) {
        p.vx *= -1;
      }
      if (p.y + p.radius > this.canvas.nativeElement.height || p.y - p.radius < 0) {
        p.vy *= -1;
      }
    });
  }

  /**
   * Draws lines between particles that are within a certain distance of each other.
   * Line opacity fades based on distance.
   */
  private drawConnections(): void {
    this.ctx.strokeStyle = 'rgba(109, 40, 217, 0.5)'; // Semi-transparent purple lines
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];

        const distance = Math.sqrt(
          Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
        );

        if (distance < this.maxDistance) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          // Fade lines based on distance
          this.ctx.strokeStyle = `rgba(109, 40, 217, ${1 - (distance / this.maxDistance)})`;
          this.ctx.stroke();
        }
      }
    }
  }

  /**
   * The main animation loop for the canvas background.
   */
  private animateCanvas(): void {
    this.updateParticles();
    this.drawParticles();
    this.drawConnections();
    requestAnimationFrame(() => this.animateCanvas()); // Loop indefinitely
  }

  /**
   * Handles the registration form submission.
   * Performs client-side validation and calls the AuthService to register the user.
   */
  onRegister(): void {
    this.errorMessage = ''; // Clear any previous error messages

    // Basic client-side validation
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      return;
    }

    // Call the authentication service to register the user
    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        // Assuming successful registration also logs the user in (AuthService handles token storage)
        this.router.navigate(['/problems']); // Redirect to a protected route
      },
      error: (error) => {
        console.error('Registration failed:', error);
        if (error.status === 400 && error.error && error.error.msg === 'User already exists') {
          this.errorMessage = 'An account with this email already exists.';
        } else if (error.status === 400 && error.error && error.error.errors) {
          // Handle validation errors from the backend (express-validator)
          this.errorMessage = error.error.errors.map((err: any) => err.msg).join('; ');
        } else {
          this.errorMessage = 'An unexpected error occurred during registration. Please try again later.';
        }
      }
    });
  }

  /**
   * Handles signup with Google.
   * NOTE: This is a placeholder. Actual implementation would involve Firebase Authentication
   * or a similar OAuth flow.
   */
  onGoogleRegister(): void {
    console.log('Google Signup initiated.');
    // Example: Call a method in AuthService for Google registration
    this.authService.googleRegister().subscribe({
      next: (response) => {
        console.log('Google Signup successful:', response);
        this.router.navigate(['/problems']);
      },
      error: (error) => {
        console.error('Google Signup failed:', error);
        this.errorMessage = 'Google signup failed. Please try again.';
      }
    });
  }
}
