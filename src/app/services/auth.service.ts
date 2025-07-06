import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  level: number;
  xp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _user = new BehaviorSubject<User | null>(null);
  readonly user$ = this._user.asObservable();

  constructor() {
    // Simulate user login on app load
    const loggedInUser: User = {
      id: 'user123',
      username: 'dev_coder',
      email: 'dev@example.com',
      role: 'user',
      level: 10,
      xp: 1250,
    };
    this._user.next(loggedInUser);
  }

  /**
   * Simulates user login with email and password.
   * @param email The user's email.
   * @param password The user's password.
   * @returns An Observable of the User object if login is successful, or an error.
   */
  login(email: string, password: string): Observable<User> {
    // In a real application, this would involve an HTTP POST request to your backend
    // to authenticate the user and receive a JWT or session token.
    console.log(`Attempting login for: ${email} with password: ${password}`);

    // Simulate successful login for specific credentials, or failure
    if (email === 'dev@example.com' && password === 'password123') {
      const loggedInUser: User = {
        id: 'user123',
        username: 'dev_coder',
        email: email,
        role: 'user',
        level: 10,
        xp: 1250,
      };
      return of(loggedInUser).pipe(
        delay(500), // Simulate API delay
        tap(user => {
          this._user.next(user);
          console.log('Login successful:', user);
        })
      );
    } else {
      // Simulate login failure
      return new Observable<User>(observer => {
        setTimeout(() => {
          observer.error({ status: 401, message: 'Invalid credentials' });
        }, 500);
      });
    }
  }

  /**
   * Simulates Google login.
   * In a real app, this would integrate with Firebase Auth or a similar OAuth provider.
   * @returns An Observable of the User object if Google login is successful, or an error.
   */
  googleLogin(): Observable<User> {
    console.log('Simulating Google login...');
    const googleUser: User = {
      id: 'google_user_456',
      username: 'google_coder',
      email: 'google@example.com',
      role: 'user',
      level: 5,
      xp: 500,
    };
    return of(googleUser).pipe(
      delay(700), // Simulate API delay for Google auth
      tap(user => {
        this._user.next(user);
        console.log('Google login successful:', user);
      })
    );
  }

  /**
   * Simulates user registration.
   * @param username The user's chosen username.
   * @param email The user's email.
   * @param password The user's password.
   * @returns An Observable of the registered User object if successful, or an error.
   */
  register(username: string, email: string, password: string): Observable<User> {
    console.log(`Attempting registration for: ${username}, ${email}`);

    // Simulate registration logic: check for existing user or validation
    if (email === 'existing@example.com') {
      return new Observable<User>(observer => {
        setTimeout(() => {
          observer.error({ status: 400, error: { msg: 'User already exists' } });
        }, 500);
      });
    }
    if (password.length < 6) {
      return new Observable<User>(observer => {
        setTimeout(() => {
          observer.error({ status: 400, error: { errors: [{ msg: 'Password must be at least 6 characters long.' }] } });
        }, 500);
      });
    }

    const newUser: User = {
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
      username: username,
      email: email,
      role: 'user',
      level: 1, // New users start at level 1
      xp: 0,    // New users start with 0 XP
    };

    return of(newUser).pipe(
      delay(1000), // Simulate API delay for registration
      tap(user => {
        this._user.next(user); // Log in the user automatically after successful registration
        console.log('Registration successful:', user);
      })
    );
  }

  /**
   * Simulates Google registration.
   * In a real app, this would integrate with Firebase Auth or a similar OAuth provider.
   * @returns An Observable of the User object if Google registration is successful, or an error.
   */
  googleRegister(): Observable<User> {
    console.log('Simulating Google registration...');
    const googleNewUser: User = {
      id: 'google_new_user_789',
      username: 'new_google_coder',
      email: 'new_google@example.com',
      role: 'user',
      level: 1,
      xp: 0,
    };
    return of(googleNewUser).pipe(
      delay(800), // Simulate API delay for Google registration
      tap(user => {
        this._user.next(user); // Log in the user automatically after successful registration
        console.log('Google registration successful:', user);
      })
    );
  }

  logout(): void {
    this._user.next(null);
    console.log('User logged out');
  }

  /**
   * Checks if a user is currently logged in.
   * @returns True if a user is logged in, false otherwise.
   */
  isLoggedIn(): boolean {
    return this._user.getValue() !== null;
  }

  updateProfile(updatedData: Partial<User>): Observable<User> {
    const currentUser = this._user.getValue();
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedData };
      return of(newUser).pipe(
        delay(1000), // Simulate API delay
        tap(user => {
          this._user.next(user);
          console.log('Profile updated:', user);
        })
      );
    }
    // In a real scenario, you might throw an error or return an empty observable
    // if there's no current user to update.
    return of(null as any); // Return observable of null if no user
  }
}
