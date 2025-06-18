
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, BookOpen, Target, Award, TrendingUp, Settings, Save, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserProfile = ({ preferences, onPreferencesUpdate, totalBooks }) => {
  const [formData, setFormData] = useState({
    name: '',
    favoriteGenres: [],
    readingGoal: 12,
    preferredLanguages: ['Italiano'],
    bio: '',
    avatarColor: 'purple'
  });

  const { toast } = useToast();

  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  const availableGenres = [
    'Narrativa', 'Fantascienza', 'Fantasy', 'Giallo/Thriller', 'Romance',
    'Storia', 'Biografia', 'Saggistica', 'Filosofia', 'Psicologia',
    'Economia', 'Tecnologia', 'Scienza', 'Arte', 'Viaggi',
    'Cucina', 'Sport', 'Fumetti', 'Poesia', 'Teatro'
  ];

  const availableLanguages = [
    'Italiano', 'Inglese', 'Francese', 'Spagnolo', 'Tedesco', 'Portoghese'
  ];

  const avatarColors = [
    { name: 'purple', class: 'bg-purple-500' },
    { name: 'blue', class: 'bg-blue-500' },
    { name: 'green', class: 'bg-green-500' },
    { name: 'red', class: 'bg-red-500' },
    { name: 'yellow', class: 'bg-yellow-500' },
    { name: 'pink', class: 'bg-pink-500' }
  ];

  const handleGenreToggle = (genre) => {
    const newGenres = formData.favoriteGenres.includes(genre)
      ? formData.favoriteGenres.filter(g => g !== genre)
      : [...formData.favoriteGenres, genre];
    
    setFormData({ ...formData, favoriteGenres: newGenres });
  };

  const handleLanguageToggle = (language) => {
    const newLanguages = formData.preferredLanguages.includes(language)
      ? formData.preferredLanguages.filter(l => l !== language)
      : [...formData.preferredLanguages, language];
    
    setFormData({ ...formData, preferredLanguages: newLanguages });
  };

  const handleSave = () => {
    onPreferencesUpdate(formData);
    toast({
      title: "Profilo aggiornato",
      description: "Le tue preferenze sono state salvate con successo",
    });
  };

  const getReadingProgress = () => {
    return Math.min(100, (totalBooks / formData.readingGoal) * 100);
  };

  const getProfileCompleteness = () => {
    let score = 0;
    if (formData.name) score += 20;
    if (formData.favoriteGenres.length > 0) score += 30;
    if (formData.bio) score += 20;
    if (formData.readingGoal > 0) score += 15;
    if (formData.preferredLanguages.length > 0) score += 15;
    return score;
  };

  const renderUserAvatar = () => {
    const colorClass = avatarColors.find(c => c.name === formData.avatarColor)?.class || 'bg-purple-500';
    const initials = formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
    
    return (
      <div className={`w-20 h-20 ${colorClass} rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
        {initials}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {renderUserAvatar()}
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {formData.name || 'Lettore BookScan'}
              </h2>
              <p className="text-muted-foreground">
                Membro della community BookScan AI
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {totalBooks}
                  </div>
                  <div className="text-xs text-muted-foreground">Libri scansionati</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formData.favoriteGenres.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Generi preferiti</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {getProfileCompleteness()}%
                  </div>
                  <div className="text-xs text-muted-foreground">Profilo completo</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reading Goal Progress */}
      {formData.readingGoal > 0 && (
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Obiettivo di Lettura {new Date().getFullYear()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progresso: {totalBooks} di {formData.readingGoal} libri</span>
                <span>{Math.round(getReadingProgress())}%</span>
              </div>
              <Progress value={getReadingProgress()} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {formData.readingGoal - totalBooks > 0 
                  ? `Ti mancano ${formData.readingGoal - totalBooks} libri per raggiungere il tuo obiettivo!`
                  : 'Congratulazioni! Hai raggiunto il tuo obiettivo di lettura!'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Settings */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Impostazioni Profilo
          </CardTitle>
          <CardDescription>
            Personalizza le tue preferenze per ricevere raccomandazioni migliori
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Il tuo nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/50 dark:bg-gray-700/50"
              />
            </div>

            <div>
              <Label>Colore Avatar</Label>
              <div className="flex gap-2 mt-2">
                {avatarColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setFormData({ ...formData, avatarColor: color.name })}
                    className={`w-8 h-8 ${color.class} rounded-full border-2 ${
                      formData.avatarColor === color.name ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Racconta qualcosa di te e dei tuoi gusti di lettura..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="bg-white/50 dark:bg-gray-700/50"
              />
            </div>

            <div>
              <Label htmlFor="readingGoal">Obiettivo di lettura annuale</Label>
              <Select
                value={formData.readingGoal.toString()}
                onValueChange={(value) => setFormData({ ...formData, readingGoal: parseInt(value) })}
              >
                <SelectTrigger className="bg-white/50 dark:bg-gray-700/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 libri all'anno</SelectItem>
                  <SelectItem value="12">12 libri all'anno</SelectItem>
                  <SelectItem value="24">24 libri all'anno</SelectItem>
                  <SelectItem value="36">36 libri all'anno</SelectItem>
                  <SelectItem value="52">52 libri all'anno</SelectItem>
                  <SelectItem value="100">100+ libri all'anno</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Favorite Genres */}
          <div>
            <Label className="text-base font-semibold">Generi Preferiti</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Seleziona i generi che ami di più (minimo 3 consigliati)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableGenres.map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox
                    id={genre}
                    checked={formData.favoriteGenres.includes(genre)}
                    onCheckedChange={() => handleGenreToggle(genre)}
                  />
                  <Label htmlFor={genre} className="text-sm cursor-pointer">
                    {genre}
                  </Label>
                </div>
              ))}
            </div>
            
            {formData.favoriteGenres.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-2">Generi selezionati:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.favoriteGenres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preferred Languages */}
          <div>
            <Label className="text-base font-semibold">Lingue Preferite</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Seleziona le lingue in cui preferisci leggere
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableLanguages.map((language) => (
                <div key={language} className="flex items-center space-x-2">
                  <Checkbox
                    id={language}
                    checked={formData.preferredLanguages.includes(language)}
                    onCheckedChange={() => handleLanguageToggle(language)}
                  />
                  <Label htmlFor={language} className="text-sm cursor-pointer">
                    {language}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Salva Preferenze
          </Button>
        </CardContent>
      </Card>

      {/* Profile Completeness */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Completezza Profilo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={getProfileCompleteness()} className="h-2" />
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Nome impostato</span>
                <span>{formData.name ? '✓' : '✗'}</span>
              </div>
              <div className="flex justify-between">
                <span>Generi selezionati</span>
                <span>{formData.favoriteGenres.length > 0 ? '✓' : '✗'}</span>
              </div>
              <div className="flex justify-between">
                <span>Bio compilata</span>
                <span>{formData.bio ? '✓' : '✗'}</span>
              </div>
              <div className="flex justify-between">
                <span>Obiettivo di lettura</span>
                <span>{formData.readingGoal > 0 ? '✓' : '✗'}</span>
              </div>
            </div>
            
            {getProfileCompleteness() === 100 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-3">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <Star className="w-4 h-4" />
                  <span className="font-semibold">Profilo Completo!</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Riceverai ora le migliori raccomandazioni personalizzate.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
