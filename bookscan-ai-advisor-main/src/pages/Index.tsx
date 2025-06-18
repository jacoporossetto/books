
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Library, User, BookOpen, Star, Scan, BarChart3, Download, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BookScanner from "@/components/BookScanner";
import PersonalLibrary from "@/components/PersonalLibrary";
import UserProfile from "@/components/UserProfile";
import Statistics from "@/components/Statistics";
import BookExport from "@/components/BookExport";
import BetaFeedback from "@/components/BetaFeedback";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [scannedBooks, setScannedBooks] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    // Carica i dati salvati dal localStorage
    const savedBooks = localStorage.getItem('scannedBooks');
    const savedPrefs = localStorage.getItem('userPreferences');
    
    if (savedBooks) {
      setScannedBooks(JSON.parse(savedBooks));
    }
    if (savedPrefs) {
      setUserPreferences(JSON.parse(savedPrefs));
    }

    // Mostra messaggio di benvenuto per beta tester
    const hasSeenWelcome = localStorage.getItem('hasSeenBetaWelcome');
    if (!hasSeenWelcome) {
      setTimeout(() => {
        toast({
          title: "Benvenuto nel Beta Program! 🎉",
          description: "Grazie per testare BookScan AI. Il tuo feedback è prezioso!",
        });
        localStorage.setItem('hasSeenBetaWelcome', 'true');
      }, 1000);
    }
  }, []);

  const handleBookScanned = (bookData) => {
    const newBooks = [...scannedBooks, { ...bookData, scannedAt: new Date().toISOString() }];
    setScannedBooks(newBooks);
    localStorage.setItem('scannedBooks', JSON.stringify(newBooks));
    
    toast({
      title: "Libro scansionato!",
      description: `${bookData.title} aggiunto alla tua libreria`,
    });
  };

  const handlePreferencesUpdate = (preferences) => {
    setUserPreferences(preferences);
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  };

  const booksRead = scannedBooks.filter(book => book.readingStatus === 'read').length;
  const averageRating = scannedBooks.filter(book => book.userRating).reduce((acc, book) => acc + book.userRating, 0) / scannedBooks.filter(book => book.userRating).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-2xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              BookScan AI
            </h1>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Beta
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Scansiona l'ISBN di qualsiasi libro e ricevi raccomandazioni personalizzate basate sui tuoi gusti
          </p>
        </div>

        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Scanner
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Library className="w-4 h-4" />
              Libreria
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistiche
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profilo
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <BookScanner 
              onBookScanned={handleBookScanned}
              userPreferences={userPreferences}
            />
            
            {/* Statistiche rapide migliorate */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {scannedBooks.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Libri scansionati
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {booksRead}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Libri letti
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                    {averageRating ? averageRating.toFixed(1) : '--'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Media voti
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {userPreferences?.favoriteGenres?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Generi preferiti
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Azioni Rapide</CardTitle>
                <CardDescription>
                  Accesso veloce alle funzionalità principali
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("library")}
                    className="h-20 flex-col gap-2"
                  >
                    <Library className="w-6 h-6" />
                    <span className="text-xs">Vai alla Libreria</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("stats")}
                    className="h-20 flex-col gap-2"
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-xs">Vedi Statistiche</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("export")}
                    className="h-20 flex-col gap-2"
                  >
                    <Download className="w-6 h-6" />
                    <span className="text-xs">Esporta Dati</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("feedback")}
                    className="h-20 flex-col gap-2"
                  >
                    <MessageSquare className="w-6 h-6" />
                    <span className="text-xs">Invia Feedback</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library">
            <PersonalLibrary 
              books={scannedBooks}
              onBooksUpdate={setScannedBooks}
            />
          </TabsContent>

          <TabsContent value="stats">
            <Statistics 
              books={scannedBooks}
              userPreferences={userPreferences}
            />
          </TabsContent>

          <TabsContent value="export">
            <BookExport books={scannedBooks} />
          </TabsContent>

          <TabsContent value="profile">
            <UserProfile 
              preferences={userPreferences}
              onPreferencesUpdate={handlePreferencesUpdate}
              totalBooks={scannedBooks.length}
            />
          </TabsContent>

          <TabsContent value="feedback">
            <BetaFeedback />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
