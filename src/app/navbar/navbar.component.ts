import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  standalone:true,
  imports:[CommonModule],
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: [] // Tailwind classes are utility-first, so often no component-specific CSS needed.
})
export class NavbarComponent {
  @Input() currentPage: string = 'home';
  @Output() setCurrentPage = new EventEmitter<string>();

  user$: Observable<any | null>;
  navItems$: Observable<{ name: string; page: string }[]>;

  constructor(public authService: AuthService) {
    this.user$ = this.authService.user$;
    this.navItems$ = this.user$.pipe(
      map(user => {
        const baseItems = [
          { name: 'Home', page: 'home' },
          { name: 'Problems', page: 'problems' },
          { name: 'Submissions', page: 'submissions' },
          { name: 'Profile', page: 'profile' },
        ];
        if (user && user.role === 'admin') {
          baseItems.push({ name: 'Admin', page: 'admin' });
        }
        return baseItems;
      })
    );
  }
}
