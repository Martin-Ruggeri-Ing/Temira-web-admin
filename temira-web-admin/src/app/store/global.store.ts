import { inject, InjectionToken } from '@angular/core';
import { Character } from '@app/models';
import { CharacterService } from '@app/services';
import {
    patchState,
    signalStore,
    withHooks,
    withMethods,
    withState,
} from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { lastValueFrom } from 'rxjs';

// si los datos no son compartidos:
// front -> dame todos los personajes -> back -> devuelve todos los personajes -> guardo los personajes en el store
// front -> update personaje -> back -> actualiza personaje -> guardo el personaje actualizado en el store
// Entonces un store es un lugar donde se guardan los datos del back modelada para el front


// representación de los datos que se guardan en el store
type StoreState = {
  characters: Character[];
};

// representación de los datos iniciales en el store
const initialState: StoreState = {
  characters: [],
};

// esto permite que la inicializacion store sea inyectable y variable
const STORE_STATE = new InjectionToken<StoreState>('GlobalStore', {
  factory: () => initialState,
});

// es un metodo que va a crear el store
// va a actuar en toda la aplicación
export const GlobalStore = signalStore(
  { providedIn: 'root' },
  withState(() => inject(STORE_STATE)),
  // withEntities es un decorador que permite agregar entidades al store
  withEntities<Character>(),
  // conMethods es un decorador que permite agregar metodos al store
  withMethods((store, characterService = inject(CharacterService)) => ({
    getCharacter(id: number) {
      // tiene parentesis porque un signal es una funcion get de un observable
      // del la lista de personajes, devuelve el personaje que tenga el id que le pasamos
      return store.characters().find((char) => char.id === id);
    },

    async addCharacter(character: Omit<Character, 'id'>) {
      try
      {
        // obtiene el ultimo valor observable y muere como una promesa
        await lastValueFrom(characterService.addCharacter(character));

        // patchState es una funcion que permite modificar el estado del store
        patchState(store, ({ characters }) => ({
          // ahora characters es una lista de personajes que tiene los personajes anteriores y el que le pasamos
          characters: 
          [
            ...characters,
            { id: new Date().getTime(), ...character },
          ],
        }));

      } catch (error) {}
    },

    async removeCharacter(id: number) {
      try {
        await lastValueFrom(characterService.removeCharacter(id));

        patchState(store, ({ characters }) => ({
          characters: characters.filter((char) => char.id !== id),
        }));

      } catch (error) {}
    },

    async updateCharacter(character: Character) {
      try {
        await lastValueFrom(characterService.updateCharacter(character));

        patchState(store, ({ characters }) => ({
          characters: characters.map((char) =>
            char.id === character.id ? { ...char, ...character } : char,
          ),
          isLoading: false,
        }));

      } catch (error) {}
    },

  })),
  // withHooks es un decorador que permite agregar hooks al store
  //  un hook es una funcion que se ejecuta en un momento especifico
  withHooks({
    //  cuando se inicializa el store, se carga la lista de personajes
    async onInit(store, characterService = inject(CharacterService)) {
      const characters = await lastValueFrom(
        characterService.getAllCharacters(),
      );
      // actualiza el estado del store
      patchState(store, { characters });
    },
  }),
);