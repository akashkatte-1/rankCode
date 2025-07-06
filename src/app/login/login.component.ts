// src/app/pages/login/login.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Import HttpClient for API calls
import { AuthService } from '../services/auth.service'; // Adjust path for AuthService
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser

@Component({
  standalone:true,
  imports:[FormsModule,CommonModule,RouterLink],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  // Form properties
  email: string = '';
  password: string = '';
  errorMessage: string = ''; // To display login errors

  // LLM Modal properties
  isModalVisible: boolean = false;
  isLoadingPitch: boolean = false;
  pitchTextContent: string = '';

  // Canvas properties
  @ViewChild('backgroundCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private particles: any[] = [];
  private numberOfParticles = 80;
  private maxDistance = 120;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient, // Inject HttpClient
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID
  ) { }

  ngOnInit(): void {
    // Optional: Check if user is already logged in and redirect
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']); // Redirect to home or problems page
    }
  }

  ngAfterViewInit(): void {
    // Initialize canvas only if running in a browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.ctx = this.canvas.nativeElement.getContext('2d')!;
      this.setCanvasDimensions();
      this.initParticles();
      this.animateCanvas();
    }
  }

  /**
   * Handles window resize events to adjust canvas dimensions.
   * @param event The resize event.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    // Only execute if running in a browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.setCanvasDimensions();
      this.initParticles(); // Re-initialize particles on resize for better distribution
    }
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
   * Handles the login form submission.
   * Calls the AuthService to authenticate the user.
   */
  onLogin(): void {
    this.errorMessage = ''; // Clear previous errors

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    // Call the authentication service
    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        this.router.navigate(['/problems']); // Redirect to a protected route
      },
      error: (error: any) => {
        console.error('Login failed:', error);
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password. Please try again.';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again later.';
        }
      }
    });
  }

  /**
   * Handles login with Google.
   * NOTE: This is a placeholder. Actual implementation would involve Firebase Authentication
   * or a similar OAuth flow.
   */
  onGoogleLogin(): void {
    console.log('Google Login initiated.');
    // Example: Call a method in AuthService for Google login
    this.authService.googleLogin().subscribe({
      next: (response: any) => {
        console.log('Google Login successful:', response);
        this.router.navigate(['/problems']);
      },
      error: (error:any) => {
        console.error('Google Login failed:', error);
        this.errorMessage = 'Google login failed. Please try again.';
      }
    });
  }

  /**
   * Shows the LLM pitch modal and triggers the API call to Gemini.
   */
  async showPitchModal(): Promise<void> {
    this.isModalVisible = true;
    this.isLoadingPitch = true;
    this.pitchTextContent = ''; // Clear previous content

    const prompt = "Generate a short, inspiring paragraph (max 100 words) explaining why a programmer should join a coding platform like HackerRank or CodeSphere, focusing on skill improvement, community, and career growth. Make it concise and motivating.";

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = { contents: chatHistory };
    const apiKey = ""; // Canvas will provide this at runtime for gemini-2.0-flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        this.pitchTextContent = result.candidates[0].content.parts[0].text;
      } else {
        this.pitchTextContent = "Could not generate pitch. Please try again.";
        console.error("Unexpected API response structure:", result);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      this.pitchTextContent = "Failed to connect to the AI. Please check your network or try again later.";
    } finally {
      this.isLoadingPitch = false;
    }
  }

  /**
   * Hides the LLM pitch modal.
   * @param event Optional: The click event to prevent closing when clicking inside the modal.
   */
  hidePitchModal(event?: MouseEvent): void {
    // Only hide if the click is on the modal backdrop, not the content itself
    if (event && event.target !== event.currentTarget) {
      return;
    }
    this.isModalVisible = false;
    this.pitchTextContent = ''; // Clear content when closing
  }
}
