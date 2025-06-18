
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, StarHalf, Users, Calendar, BookOpen, ThumbsUp, ThumbsDown } from "lucide-react";

const BookRecommendation = ({ book, onAccept, onReject }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />);
    }

    return stars;
  };

  const getRecommendationColor = (stars) => {
    if (stars >= 4) return "text-green-600 dark:text-green-400";
    if (stars >= 3) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Raccomandazione AI
        </CardTitle>
        <CardDescription>
          Analisi personalizzata basata sui tuoi gusti di lettura
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Book Cover */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <img
              src={book.thumbnail}
              alt={book.title}
              className="w-32 h-44 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/150x200?text=No+Cover';
              }}
            />
          </div>

          {/* Book Details */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {book.title}
              </h3>
              <p className="text-muted-foreground font-medium">
                di {book.authors?.join(', ') || 'Autore sconosciuto'}
              </p>
            </div>

            {/* AI Recommendation Score */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Raccomandazione AI:</span>
                <div className={`text-2xl font-bold ${getRecommendationColor(book.recommendation.stars)}`}>
                  {book.recommendation.score}/5
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                {renderStars(book.recommendation.stars)}
                <span className="text-sm text-muted-foreground">
                  ({book.recommendation.stars} stelle)
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground italic">
                {book.recommendation.reasoning}
              </p>
            </div>

            {/* Book Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{book.ratingsCount?.toLocaleString() || 0} recensioni</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Pubblicato: {book.publishedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span>{book.pageCount || 'N/A'} pagine</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Media: {book.averageRating || 'N/A'}/5</span>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Generi:</h4>
              <div className="flex flex-wrap gap-2">
                {book.categories?.map((category, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Descrizione:</h4>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {book.description}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={onAccept}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            Aggiungi alla Libreria
          </Button>
          <Button
            onClick={onReject}
            variant="outline"
            className="flex-1"
          >
            <ThumbsDown className="w-4 h-4 mr-2" />
            Scarta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookRecommendation;
