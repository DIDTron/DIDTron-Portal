import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Globe, ShoppingCart, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvailableDID {
  id: string;
  number: string;
  country: string;
  city: string;
  type: "local" | "tollfree" | "mobile";
  setupFee: number;
  monthlyRate: number;
  features: string[];
}

export default function DIDSearchPage() {
  const { toast } = useToast();
  const [country, setCountry] = useState("");
  const [didType, setDidType] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [cart, setCart] = useState<string[]>([]);

  const availableDIDs: AvailableDID[] = [
    { id: "1", number: "+1 (555) 100-0001", country: "United States", city: "New York", type: "local", setupFee: 0, monthlyRate: 1.50, features: ["SMS", "Fax"] },
    { id: "2", number: "+1 (555) 100-0002", country: "United States", city: "New York", type: "local", setupFee: 0, monthlyRate: 1.50, features: ["SMS"] },
    { id: "3", number: "+1 (800) 555-0001", country: "United States", city: "Toll Free", type: "tollfree", setupFee: 5, monthlyRate: 4.00, features: [] },
    { id: "4", number: "+44 20 1234 5001", country: "United Kingdom", city: "London", type: "local", setupFee: 2, monthlyRate: 2.50, features: ["SMS"] },
    { id: "5", number: "+49 30 1234 5001", country: "Germany", city: "Berlin", type: "local", setupFee: 2, monthlyRate: 2.00, features: [] },
  ];

  const addToCart = (didId: string) => {
    if (!cart.includes(didId)) {
      setCart([...cart, didId]);
      toast({ title: "Added to cart", description: "DID has been added to your cart" });
    }
  };

  const removeFromCart = (didId: string) => {
    setCart(cart.filter(id => id !== didId));
  };

  const checkout = () => {
    toast({ title: "Processing", description: `Purchasing ${cart.length} DIDs...` });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search DIDs</h1>
        <p className="text-muted-foreground">Find and purchase new phone numbers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Criteria</CardTitle>
          <CardDescription>Filter available DIDs by country, type, or area code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger data-testid="select-country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={didType} onValueChange={setDidType}>
                <SelectTrigger data-testid="select-type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="tollfree">Toll Free</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Area Code / Pattern</Label>
              <Input 
                placeholder="e.g., 555"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value)}
                data-testid="input-area-code"
              />
            </div>
            <div className="space-y-2 flex items-end">
              <Button className="w-full" data-testid="button-search">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available DIDs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Setup</TableHead>
                    <TableHead>Monthly</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableDIDs.map((did) => (
                    <TableRow key={did.id} data-testid={`row-available-${did.id}`}>
                      <TableCell className="font-mono">{did.number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {did.city}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{did.type}</Badge>
                      </TableCell>
                      <TableCell>${did.setupFee.toFixed(2)}</TableCell>
                      <TableCell>${did.monthlyRate.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {did.features.map(f => (
                            <Badge key={f} variant="secondary">{f}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {cart.includes(did.id) ? (
                          <Button size="sm" variant="outline" onClick={() => removeFromCart(did.id)}>
                            <Check className="h-3 w-3 mr-1" />
                            Added
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => addToCart(did.id)}>
                            Add
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No DIDs in cart
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map(didId => {
                  const did = availableDIDs.find(d => d.id === didId);
                  if (!did) return null;
                  return (
                    <div key={did.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <span className="font-mono text-sm">{did.number}</span>
                      <span className="text-sm">${did.monthlyRate}/mo</span>
                    </div>
                  );
                })}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-sm mb-3">
                    <span>Monthly Total:</span>
                    <span className="font-bold">
                      ${cart.reduce((acc, id) => {
                        const did = availableDIDs.find(d => d.id === id);
                        return acc + (did?.monthlyRate || 0);
                      }, 0).toFixed(2)}
                    </span>
                  </div>
                  <Button className="w-full" onClick={checkout} data-testid="button-checkout">
                    Checkout
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
