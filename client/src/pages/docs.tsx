import { useQuery } from "@tanstack/react-query";
import { STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, Search, ChevronRight, ArrowLeft, 
  ThumbsUp, Eye, Clock, Home
} from "lucide-react";
import { useState } from "react";
import type { DocCategory, DocArticle } from "@shared/schema";

export default function DocsPage() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const pathParts = location.replace("/docs", "").split("/").filter(Boolean);
  const categorySlug = pathParts[0] || null;
  const articleSlug = pathParts[1] || null;

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<DocCategory[]>({
    queryKey: ["/api/docs/categories"],
    staleTime: STALE_TIME.STATIC,
    placeholderData: keepPreviousData,
  });

  const { data: articles = [], isLoading: articlesLoading } = useQuery<DocArticle[]>({
    queryKey: ["/api/docs/articles"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const publishedCategories = categories.filter(c => c.isPublished);
  const publishedArticles = articles.filter(a => a.isPublished);

  const selectedCategory = categorySlug 
    ? publishedCategories.find(c => c.slug === categorySlug) 
    : null;

  const selectedArticle = articleSlug && selectedCategory
    ? publishedArticles.find(a => a.slug === articleSlug && a.categoryId === selectedCategory.id)
    : null;

  const categoryArticles = selectedCategory
    ? publishedArticles.filter(a => a.categoryId === selectedCategory.id).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    : [];

  const filteredArticles = searchQuery.trim()
    ? publishedArticles.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  if (categoriesLoading || articlesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading documentation...</div>
      </div>
    );
  }

  if (selectedArticle && selectedCategory) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b sticky top-0 z-50 bg-background">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link href="/docs">
              <Button variant="ghost" size="sm" data-testid="link-docs-home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Documentation
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href={`/docs/${selectedCategory.slug}`}>
                <span className="hover:text-foreground cursor-pointer" data-testid="link-category-breadcrumb">
                  {selectedCategory.name}
                </span>
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{selectedArticle.title}</span>
            </nav>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <article>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-3" data-testid="text-article-title">
                {selectedArticle.title}
              </h1>
              {selectedArticle.excerpt && (
                <p className="text-lg text-muted-foreground mb-4">
                  {selectedArticle.excerpt}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {selectedArticle.viewCount} views
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {selectedArticle.helpfulCount} found helpful
                </span>
                {selectedArticle.updatedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Updated {new Date(selectedArticle.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedArticle.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <Separator className="my-6" />
            
            <div 
              className="prose prose-neutral dark:prose-invert max-w-none"
              data-testid="text-article-content"
            >
              {(selectedArticle.content || '').split('\n').map((line, i) => {
                if (line.startsWith('# ')) {
                  return <h1 key={i} className="text-2xl font-bold mt-8 mb-4">{line.slice(2)}</h1>;
                }
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="text-xl font-semibold mt-6 mb-3">{line.slice(3)}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={i} className="text-lg font-medium mt-4 mb-2">{line.slice(4)}</h3>;
                }
                if (line.startsWith('- ')) {
                  return <li key={i} className="ml-4">{line.slice(2)}</li>;
                }
                if (line.startsWith('```')) {
                  return null;
                }
                if (line.trim() === '') {
                  return <br key={i} />;
                }
                return <p key={i} className="mb-4">{line}</p>;
              })}
            </div>
          </article>
          
          {categoryArticles.length > 1 && (
            <div className="mt-12">
              <Separator className="mb-6" />
              <h3 className="text-lg font-semibold mb-4">More in {selectedCategory.name}</h3>
              <div className="grid gap-3">
                {categoryArticles
                  .filter(a => a.id !== selectedArticle.id)
                  .slice(0, 3)
                  .map(article => (
                    <Link key={article.id} href={`/docs/${selectedCategory.slug}/${article.slug}`}>
                      <Card className="hover-elevate cursor-pointer" data-testid={`card-related-article-${article.id}`}>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">{article.title}</CardTitle>
                          {article.excerpt && (
                            <CardDescription className="text-sm line-clamp-1">
                              {article.excerpt}
                            </CardDescription>
                          )}
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b sticky top-0 z-50 bg-background">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link href="/docs">
              <Button variant="ghost" size="sm" data-testid="link-docs-home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Documentation
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm font-medium">{selectedCategory.name}</span>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" data-testid="text-category-title">
              {selectedCategory.name}
            </h1>
            {selectedCategory.description && (
              <p className="text-muted-foreground">{selectedCategory.description}</p>
            )}
          </div>
          
          {categoryArticles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No articles in this category yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {categoryArticles.map(article => (
                <Link key={article.id} href={`/docs/${selectedCategory.slug}/${article.slug}`}>
                  <Card className="hover-elevate cursor-pointer" data-testid={`card-article-${article.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{article.title}</CardTitle>
                          {article.excerpt && (
                            <CardDescription className="mt-1 line-clamp-2">
                              {article.excerpt}
                            </CardDescription>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                      </div>
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {article.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Documentation</h1>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" data-testid="link-home">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-docs"
            />
          </div>
        </div>

        {searchQuery.trim() && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">
              Search Results ({filteredArticles.length})
            </h2>
            {filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No articles found matching "{searchQuery}"
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredArticles.map(article => {
                  const category = publishedCategories.find(c => c.id === article.categoryId);
                  return (
                    <Link key={article.id} href={`/docs/${category?.slug}/${article.slug}`}>
                      <Card className="hover-elevate cursor-pointer" data-testid={`card-search-result-${article.id}`}>
                        <CardHeader className="py-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <span>{category?.name}</span>
                          </div>
                          <CardTitle className="text-base">{article.title}</CardTitle>
                          {article.excerpt && (
                            <CardDescription className="text-sm line-clamp-2">
                              {article.excerpt}
                            </CardDescription>
                          )}
                        </CardHeader>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!searchQuery.trim() && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-2">How can we help you?</h2>
              <p className="text-muted-foreground">
                Browse our documentation to learn about DIDTron's VoIP services
              </p>
            </div>
            
            {publishedCategories.length === 0 ? (
              <Card className="max-w-md mx-auto">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documentation available yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {publishedCategories.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)).map(category => {
                  const catArticles = publishedArticles.filter(a => a.categoryId === category.id);
                  return (
                    <Link key={category.id} href={`/docs/${category.slug}`}>
                      <Card className="h-full hover-elevate cursor-pointer" data-testid={`card-category-${category.id}`}>
                        <CardHeader>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-md bg-primary/10">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                          </div>
                          {category.description && (
                            <CardDescription className="line-clamp-2">
                              {category.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{catArticles.length} article{catArticles.length !== 1 ? 's' : ''}</span>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
