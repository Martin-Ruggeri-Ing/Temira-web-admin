import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CharacterAdapter } from '@app/adapters';
import { Character, CharacterInfo } from '@app/models';
import { catchError, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private readonly baseUrl = 'https://rickandmortyapi.com/api/character';
  http = inject(HttpClient);

  getAllCharacters(): Observable<Character[]> {
    return this.http.get<CharacterInfo>(this.baseUrl)
      .pipe(map((characterInfo) => CharacterAdapter(characterInfo)))
  }

  addCharacter(character: Omit<Character, "id">): Observable<void> {
    return this.http.post<void>(this.baseUrl, { character })
      .pipe(
        catchError((error) => {
          console.error('Error adding character', error);
          return Promise.resolve();
        })
      );
  }

  removeCharacter(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<void>(url)
      .pipe(
        catchError((error) => {
          console.error('Error removing character', error);
          return Promise.resolve();
        })
      );
  }

  updateCharacter(character: Character): Observable<void> {
    return this.http.put<void>(this.baseUrl, { character })
      .pipe(
        catchError((error) => {
          console.error('Error updating character', error);
          return Promise.resolve();
        })
      );
  }

}
