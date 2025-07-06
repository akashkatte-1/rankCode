import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 
import { AuthService } from '../services/auth.service'; 
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
  errorMessage: string = ''; 

  @ViewChild('backgroundCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private particles: any[] = [];
  private numberOfParticles = 80;
  private maxDistance = 120;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.setCanvasDimensions();
    this.initParticles();
    this.animateCanvas();
  }

 
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.setCanvasDimensions();
    this.initParticles(); 
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
    requestAnimationFrame(() => this.animateCanvas()); // Loop indefinitely
  }

  
  onRegister(): void {
    this.errorMessage = '';

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

    this.authService.register(this.username, this.email, this.password).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.router.navigate(['/problems']); // Redirect to a protected route
      },
      error: (error) => {
        console.error('Registration failed:', error);
        if (error.status === 400 && error.error && error.error.msg === 'User already exists') {
          this.errorMessage = 'An account with this email already exists.';
        } else if (error.status === 400 && error.error && error.error.errors) {
          this.errorMessage = error.error.errors.map((err: any) => err.msg).join('; ');
        } else {
          this.errorMessage = 'An unexpected error occurred during registration. Please try again later.';
        }
      }
    });
  }

 
  onGoogleRegister(): void {
    console.log('Google Signup initiated.');
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
