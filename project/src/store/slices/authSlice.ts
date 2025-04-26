import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'superuser' | 'operator' | 'viewer';
  farm_id?: string;
}

interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    // First sign in the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError) throw new Error(authError.message);
    if (!authData.session?.user?.id) throw new Error('No se pudo obtener la información del usuario');

    // Then fetch their profile
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.session.user.id);

    if (profileError) throw new Error(profileError.message);
    if (!profiles || profiles.length === 0) {
      throw new Error('No se encontró el perfil del usuario');
    }

    const profile = profiles[0];
    return {
      session: authData.session,
      profile: {
        id: profile.id,
        name: profile.name,
        email: authData.session.user.email,
        role: profile.role,
        farm_id: profile.farm_id
      }
    };
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }) => {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
        },
      },
    });

    if (signUpError) throw new Error(signUpError.message);
    if (!authData.session) {
      // Registration successful but needs email confirmation
      return { session: null, message: 'Por favor revisa tu correo para confirmar tu cuenta' };
    }

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Fetch the newly created profile
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.session.user.id);

    if (profileError) throw new Error(profileError.message);
    if (!profiles || profiles.length === 0) {
      throw new Error('No se pudo crear el perfil del usuario');
    }

    const profile = profiles[0];
    return {
      session: authData.session,
      profile: {
        id: profile.id,
        name: profile.name,
        email: authData.session.user.email,
        role: profile.role,
        farm_id: profile.farm_id
      }
    };
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
});

// Check for existing session on app load
export const checkSession = createAsyncThunk('auth/checkSession', async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) throw new Error(sessionError.message);
  if (!session) return { session: null, profile: null };

  // Fetch the user's profile
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id);

  if (profileError) throw new Error(profileError.message);
  if (!profiles || profiles.length === 0) {
    throw new Error('No se encontró el perfil del usuario');
  }

  const profile = profiles[0];
  return {
    session,
    profile: {
      id: profile.id,
      name: profile.name,
      email: session.user.email,
      role: profile.role,
      farm_id: profile.farm_id
    }
  };
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload.session;
        state.user = action.payload.profile;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error en el inicio de sesión';
      })
      .addCase(register.fulfilled, (state, action) => {
        if (action.payload.session) {
          state.session = action.payload.session;
          state.user = action.payload.profile;
        }
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.error.message || 'Error en el registro';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.session = null;
        state.error = null;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.session = action.payload.session;
        state.user = action.payload.profile;
        state.error = null;
      });
  },
});

export default authSlice.reducer;