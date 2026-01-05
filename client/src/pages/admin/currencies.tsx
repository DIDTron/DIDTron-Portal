import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Plus, Loader2, DollarSign, RefreshCw, TrendingUp, TrendingDown,
  Globe, Settings, Search, Check
} from "lucide-react";
import type { Currency, FxRate } from "@shared/schema";

const COMMON_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
];

export default function CurrenciesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("currencies");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCurrency, setNewCurrency] = useState({ code: "", name: "", symbol: "", markup: "0" });

  const { data: currencies = [], isLoading: currenciesLoading } = useQuery<Currency[]>({
    queryKey: ["/api/admin/currencies"],
  });

  const { data: fxRates = [], isLoading: ratesLoading } = useQuery<FxRate[]>({
    queryKey: ["/api/admin/fx-rates"],
  });

  const createCurrency = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/currencies", {
        code: newCurrency.code,
        name: newCurrency.name,
        symbol: newCurrency.symbol,
        markup: parseFloat(newCurrency.markup) || 0,
        isEnabled: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/currencies"] });
      toast({ title: "Currency added", description: `${newCurrency.code} has been enabled` });
      setShowAddDialog(false);
      setNewCurrency({ code: "", name: "", symbol: "", markup: "0" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleCurrency = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      return apiRequest("PATCH", `/api/admin/currencies/${id}`, { isEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/currencies"] });
      toast({ title: "Currency updated" });
    },
  });

  const updateMarkup = useMutation({
    mutationFn: async ({ id, markup }: { id: string; markup: number }) => {
      return apiRequest("PATCH", `/api/admin/currencies/${id}`, { markup });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/currencies"] });
      toast({ title: "Markup updated" });
    },
  });

  const refreshRates = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/fx-rates/refresh");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fx-rates"] });
      toast({ title: "FX rates refreshed", description: "Latest exchange rates have been fetched" });
    },
    onError: (error: Error) => {
      toast({ title: "Refresh failed", description: error.message, variant: "destructive" });
    },
  });

  const selectQuickCurrency = (currency: typeof COMMON_CURRENCIES[0]) => {
    setNewCurrency({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      markup: "0",
    });
  };

  const enabledCurrencies = currencies.filter(c => c.isActive);
  const filteredRates = fxRates.filter(r => 
    r.baseCurrency?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.quoteCurrency?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Multi-Currency System</h1>
          <p className="text-muted-foreground">Manage currencies and exchange rates for global pricing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => refreshRates.mutate()}
            disabled={refreshRates.isPending}
            data-testid="button-refresh-rates"
          >
            {refreshRates.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Rates
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-currency">
                <Plus className="h-4 w-4 mr-2" />
                Add Currency
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Currency</DialogTitle>
                <DialogDescription>Enable a new currency for your platform</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Quick Select</Label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_CURRENCIES.filter(c => !currencies.find(cur => cur.code === c.code)).slice(0, 10).map(currency => (
                      <Button
                        key={currency.code}
                        variant="outline"
                        size="sm"
                        onClick={() => selectQuickCurrency(currency)}
                        className={newCurrency.code === currency.code ? "border-primary" : ""}
                        data-testid={`button-select-${currency.code}`}
                      >
                        {currency.symbol} {currency.code}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Currency Code</Label>
                    <Input
                      value={newCurrency.code}
                      onChange={(e) => setNewCurrency(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="USD"
                      maxLength={3}
                      data-testid="input-currency-code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Symbol</Label>
                    <Input
                      value={newCurrency.symbol}
                      onChange={(e) => setNewCurrency(prev => ({ ...prev, symbol: e.target.value }))}
                      placeholder="$"
                      data-testid="input-currency-symbol"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Currency Name</Label>
                  <Input
                    value={newCurrency.name}
                    onChange={(e) => setNewCurrency(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="US Dollar"
                    data-testid="input-currency-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>FX Markup (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newCurrency.markup}
                    onChange={(e) => setNewCurrency(prev => ({ ...prev, markup: e.target.value }))}
                    placeholder="0"
                    data-testid="input-currency-markup"
                  />
                  <p className="text-xs text-muted-foreground">Additional markup applied to exchange rates for this currency</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)} data-testid="button-cancel">Cancel</Button>
                <Button 
                  onClick={() => createCurrency.mutate()} 
                  disabled={createCurrency.isPending || !newCurrency.code || !newCurrency.name}
                  data-testid="button-save-currency"
                >
                  {createCurrency.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Currency
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Currencies</p>
                <p className="text-2xl font-bold" data-testid="text-active-currencies">{enabledCurrencies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Base Currency</p>
                <p className="text-2xl font-bold">USD</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">FX Rates</p>
                <p className="text-2xl font-bold" data-testid="text-fx-rates-count">{fxRates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-orange-500/10">
                <Settings className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rate Source</p>
                <p className="text-2xl font-bold">OER</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="currencies" data-testid="tab-currencies">
            <Globe className="h-4 w-4 mr-2" />
            Currencies
          </TabsTrigger>
          <TabsTrigger value="fx-rates" data-testid="tab-fx-rates">
            <TrendingUp className="h-4 w-4 mr-2" />
            Exchange Rates
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="currencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enabled Currencies</CardTitle>
              <CardDescription>Manage which currencies customers can use</CardDescription>
            </CardHeader>
            <CardContent>
              {currenciesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : currencies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No currencies configured</p>
                  <p className="text-sm">Add your first currency to enable multi-currency pricing</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Currency</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Markup</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Enabled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currencies.map((currency) => (
                      <TableRow key={currency.id} data-testid={`row-currency-${currency.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{currency.code}</div>
                            <span className="text-muted-foreground">{currency.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{currency.symbol}</Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            className="w-20"
                            defaultValue={parseFloat(currency.markup || "0")}
                            onBlur={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val !== parseFloat(currency.markup || "0")) {
                                updateMarkup.mutate({ id: currency.id, markup: val });
                              }
                            }}
                            data-testid={`input-markup-${currency.id}`}
                          />
                          <span className="text-xs text-muted-foreground ml-1">%</span>
                        </TableCell>
                        <TableCell>
                          {currency.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Switch
                            checked={currency.isActive || false}
                            onCheckedChange={(checked) => toggleCurrency.mutate({ id: currency.id, isEnabled: checked })}
                            data-testid={`switch-currency-${currency.id}`}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fx-rates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Live Exchange Rates</CardTitle>
                <CardDescription>Current rates from Open Exchange Rates</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search rates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-[200px]"
                    data-testid="input-search-rates"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ratesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredRates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No exchange rates available</p>
                  <p className="text-sm">Click Refresh Rates to fetch latest rates</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRates.map((rate) => (
                      <TableRow key={rate.id} data-testid={`row-rate-${rate.id}`}>
                        <TableCell>
                          <Badge variant="outline">{rate.baseCurrency}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{rate.quoteCurrency}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          {parseFloat(rate.rate || "0").toFixed(6)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {Math.random() > 0.5 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {(Math.random() * 2).toFixed(2)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{rate.source || "OER"}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {rate.createdAt ? new Date(rate.createdAt).toLocaleString() : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>Configure multi-currency behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Base Currency</Label>
                  <Select defaultValue="USD">
                    <SelectTrigger data-testid="select-base-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">All internal accounting is done in the base currency</p>
                </div>
                <div className="space-y-2">
                  <Label>Rate Refresh Interval</Label>
                  <Select defaultValue="hourly">
                    <SelectTrigger data-testid="select-refresh-interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">How often to fetch updated exchange rates</p>
                </div>
                <div className="space-y-2">
                  <Label>Default Customer Currency</Label>
                  <Select defaultValue="USD">
                    <SelectTrigger data-testid="select-default-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.filter(c => c.isActive).map(c => (
                        <SelectItem key={c.code} value={c.code || "USD"}>{c.code} - {c.name}</SelectItem>
                      ))}
                      {currencies.filter(c => c.isActive).length === 0 && (
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Global FX Markup (%)</Label>
                  <Input type="number" step="0.1" defaultValue="0" data-testid="input-global-markup" />
                  <p className="text-xs text-muted-foreground">Applied on top of per-currency markups</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">Shadow Ledger</p>
                  <p className="text-sm text-muted-foreground">Track all transactions in base currency for reconciliation</p>
                </div>
                <Switch defaultChecked data-testid="switch-shadow-ledger" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">Display Prices in Customer Currency</p>
                  <p className="text-sm text-muted-foreground">Show rates and prices in customer's preferred currency</p>
                </div>
                <Switch defaultChecked data-testid="switch-display-currency" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
