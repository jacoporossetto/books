
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Library, Search, Star, Calendar, BookOpen, Filter, Trash2, Edit3, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PersonalLibrary = ({ books, onBooksUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [readingStatus, setReadingStatus] = useState('want-to-read');
  const { toast } = useToast();

  const filteredAndSortedBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.authors?.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'rated') return matchesSearch && book.userRating;
      if (filterBy === 'unrated') return matchesSearch && !book.userRating;
      if (filterBy === 'high-rated') return matchesSearch && book.recommendation?.stars >= 4;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return (a.authors?.[0] || '').localeCompare(b.authors?.[0] || '');
        case 'rating':
          return (b.recommendation?.score || 0) - (a.recommendation?.score || 0);
        case 'date':
        default:
          const dateA = new Date(a.scannedAt).getTime();
          const dateB = new Date(b.scannedAt).getTime();
          return dateB - dateA;
      }
    });

  const handleBookUpdate = (bookIndex, updates) => {
    const updatedBooks = [...books];
    updatedBooks[bookIndex] = { ...updatedBooks[bookIndex], ...updates };
    onBooksUpdate(updatedBooks);
    localStorage.setItem('scannedBooks', JSON.stringify(updatedBooks));
    
    toast({
      title: "Libro aggiornato",
      description: "Le tue modifiche sono state salvate",
    });
  };

  const handleDeleteBook = (bookIndex) => {
    const updatedBooks = books.filter((_, index) => index !== bookIndex);
    onBooksUpdate(updatedBooks);
    localStorage.setItem('scannedBooks', JSON.stringify(updatedBooks));
    
    toast({
      title: "Libro rimosso",
      description: "Il libro è stato eliminato dalla tua libreria",
    });
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={interactive ? () => onStarClick(i + 1) : undefined}
      />
    ));
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'read': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'reading': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'want-to-read': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'read': return 'Letto';
      case 'reading': return 'Sto leggendo';
      case 'want-to-read': return 'Da leggere';
      default: return 'Sconosciuto';
    }
  };

  const booksByStatus = {
    'want-to-read': filteredAndSortedBooks.filter(book => (book.readingStatus || 'want-to-read') === 'want-to-read'),
    'reading': filteredAndSortedBooks.filter(book => book.readingStatus === 'reading'),
    'read': filteredAndSortedBooks.filter(book => book.readingStatus === 'read'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Library className="w-6 h-6" />
            La Mia Libreria
          </CardTitle>
          <CardDescription>
            {books.length} libri nella tua collezione personale
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Cerca per titolo o autore..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-700/50"
                />
              </div>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-white/50 dark:bg-gray-700/50">
                <SelectValue placeholder="Ordina per" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data aggiunta</SelectItem>
                <SelectItem value="title">Titolo</SelectItem>
                <SelectItem value="author">Autore</SelectItem>
                <SelectItem value="rating">Valutazione AI</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full md:w-48 bg-white/50 dark:bg-gray-700/50">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtra" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i libri</SelectItem>
                <SelectItem value="rated">Libri valutati</SelectItem>
                <SelectItem value="unrated">Non valutati</SelectItem>
                <SelectItem value="high-rated">Raccomandati (4+ stelle)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Books organized by reading status */}
      <Tabs defaultValue="want-to-read" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <TabsTrigger value="want-to-read" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Da leggere ({booksByStatus['want-to-read'].length})
          </TabsTrigger>
          <TabsTrigger value="reading" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            In lettura ({booksByStatus.reading.length})
          </TabsTrigger>
          <TabsTrigger value="read" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Letti ({booksByStatus.read.length})
          </TabsTrigger>
        </TabsList>

        {Object.entries(booksByStatus).map(([status, booksInStatus]) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {booksInStatus.length === 0 ? (
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nessun libro in questa categoria
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {booksInStatus.map((book, index) => {
                  const originalIndex = books.findIndex(b => b.isbn === book.isbn && b.scannedAt === book.scannedAt);
                  
                  return (
                    <Card key={`${book.isbn}-${book.scannedAt}`} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <img
                            src={book.thumbnail}
                            alt={book.title}
                            className="w-16 h-22 object-cover rounded-md shadow-sm flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/150x200?text=No+Cover';
                            }}
                          />
                          
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-sm line-clamp-2">
                              {book.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {book.authors?.join(', ')}
                            </p>
                            
                            {/* AI Rating */}
                            <div className="flex items-center gap-1">
                              {renderStars(book.recommendation?.stars || 0)}
                              <span className="text-xs text-muted-foreground ml-1">
                                AI: {book.recommendation?.score || 'N/A'}
                              </span>
                            </div>

                            {/* User Rating */}
                            {book.userRating && (
                              <div className="flex items-center gap-1">
                                {renderStars(book.userRating)}
                                <span className="text-xs text-muted-foreground ml-1">
                                  Tua: {book.userRating}
                                </span>
                              </div>
                            )}

                            {/* Status Badge */}
                            <Badge className={`text-xs ${getStatusBadgeColor(book.readingStatus || 'want-to-read')}`}>
                              {getStatusLabel(book.readingStatus || 'want-to-read')}
                            </Badge>

                            {/* Action Buttons */}
                            <div className="flex gap-1 pt-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-xs"
                                    onClick={() => {
                                      setSelectedBook(book);
                                      setUserRating(book.userRating || 0);
                                      setUserReview(book.userReview || '');
                                      setReadingStatus(book.readingStatus || 'want-to-read');
                                    }}
                                  >
                                    <Edit3 className="w-3 h-3 mr-1" />
                                    Modifica
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Modifica libro</DialogTitle>
                                    <DialogDescription>
                                      Aggiorna le informazioni e la tua valutazione
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  {selectedBook && (
                                    <div className="space-y-6">
                                      <div className="flex gap-4">
                                        <img
                                          src={selectedBook.thumbnail}
                                          alt={selectedBook.title}
                                          className="w-24 h-32 object-cover rounded-lg"
                                        />
                                        <div>
                                          <h3 className="font-semibold text-lg">{selectedBook.title}</h3>
                                          <p className="text-muted-foreground">{selectedBook.authors?.join(', ')}</p>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <div>
                                          <Label>Stato di lettura</Label>
                                          <Select value={readingStatus} onValueChange={setReadingStatus}>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="want-to-read">Da leggere</SelectItem>
                                              <SelectItem value="reading">Sto leggendo</SelectItem>
                                              <SelectItem value="read">Letto</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        <div>
                                          <Label>La tua valutazione</Label>
                                          <div className="flex gap-1 mt-2">
                                            {renderStars(userRating, true, setUserRating)}
                                          </div>
                                        </div>

                                        <div>
                                          <Label>La tua recensione (opzionale)</Label>
                                          <Textarea
                                            placeholder="Scrivi la tua opinione sul libro..."
                                            value={userReview}
                                            onChange={(e) => setUserReview(e.target.value)}
                                            className="mt-2"
                                          />
                                        </div>
                                      </div>

                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => {
                                            handleBookUpdate(originalIndex, {
                                              userRating,
                                              userReview,
                                              readingStatus,
                                              reviewDate: new Date().toISOString()
                                            });
                                            setSelectedBook(null);
                                          }}
                                          className="flex-1"
                                        >
                                          Salva modifiche
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteBook(originalIndex)}
                                className="text-xs px-2"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PersonalLibrary;
