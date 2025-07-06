import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 
import { AuthService } from '../services/auth.service'; 
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
@Component({
  standalone:true,
  imports:[FormsModule,CommonModule,RouterLink],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  email: string = '';
  password: string = '';
  errorMessage: string = ''; 

  isModalVisible: boolean = false;
  isLoadingPitch: boolean = false;
  pitchTextContent: string = '';

  @ViewChild('backgroundCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private particles: any[] = [];
  private numberOfParticles = 80;
  private maxDistance = 120;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient, 
    @Inject(PLATFORM_ID) private platformId: Object 
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']); 
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ctx = this.canvas.nativeElement.getContext('2d')!;
      this.setCanvasDimensions();
      this.initParticles();
      this.animateCanvas();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setCanvasDimensions();
      this.initParticles(); 
    }
  }

 
  private setCanvasDimensions(): void {
    this.canvas.nativeElement.width = window.innerWidth;
    this.canvas.nativeElement.height = window.innerHeight;
  }

 
  private initParticles(): void {
    this.particles = [];
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.nativeElement.width,
        y: Math.random() * this.canvas.nativeElement.height,
        vx: (Math.random() - 0.5) * 1, 
        vy: (Math.random() - 0.5) * 1,
        radius: Math.random() * 1.5 + 0.5 
      });
    }
  }

  
  private drawParticles(): void {
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.ctx.fillStyle = '#6b21a8'; 
    this.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

 
  private updateParticles(): void {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x + p.radius > this.canvas.nativeElement.width || p.x - p.radius < 0) {
        p.vx *= -1;
      }
      if (p.y + p.radius > this.canvas.nativeElement.height || p.y - p.radius < 0) {
        p.vy *= -1;
      }
    });
  }

  
  private drawConnections(): void {
    this.ctx.strokeStyle = 'rgba(109, 40, 217, 0.5)'; 
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
          this.ctx.strokeStyle = `rgba(109, 40, 217, ${1 - (distance / this.maxDistance)})`;
          this.ctx.stroke();
        }
      }
    }
  }

  
  private animateCanvas(): void {
    this.updateParticles();
    this.drawParticles();
    this.drawConnections();
    requestAnimationFrame(() => this.animateCanvas()); 
  }

  
  onLogin(): void {
    this.errorMessage = ''; 

    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        this.router.navigate(['/problems']);
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

 
  onGoogleLogin(): void {
    console.log('Google Login initiated.');
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

 
  async showPitchModal(): Promise<void> {
    this.isModalVisible = true;
    this.isLoadingPitch = true;
    this.pitchTextContent = ''; // Clear previous content

    const prompt = "Generate a short, inspiring paragraph (max 100 words) explaining why a programmer should join a coding platform like HackerRank or CodeSphere, focusing on skill improvement, community, and career growth. Make it concise and motivating.";

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = { contents: chatHistory };
    const apiKey = ""; 
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

  
  hidePitchModal(event?: MouseEvent): void {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    this.isModalVisible = false;
    this.pitchTextContent = ''; 
  }
}
