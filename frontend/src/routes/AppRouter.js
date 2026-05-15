import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import NoteEditorPage from '../pages/NoteEditorPage';
import TrashPage from '../pages/TrashPage';
import FavouritesPage from '../pages/FavouritesPage';
import SearchPage from '../pages/SearchPage';
import SettingsPage from '../pages/SettingsPage';
import SharedNotePage from '../pages/SharedNotePage';
import SharedWithMePage from '../pages/SharedWithMePage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/share/:token" element={<SharedNotePage />} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/notes/new" element={<PrivateRoute><NoteEditorPage /></PrivateRoute>} />
      <Route path="/notes/:id" element={<PrivateRoute><NoteEditorPage /></PrivateRoute>} />
      <Route path="/trash" element={<PrivateRoute><TrashPage /></PrivateRoute>} />
      <Route path="/favourites" element={<PrivateRoute><FavouritesPage /></PrivateRoute>} />
      <Route path="/shared-with-me" element={<PrivateRoute><SharedWithMePage /></PrivateRoute>} />
      <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
