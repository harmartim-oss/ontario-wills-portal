import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import DocumentCreator from "./pages/DocumentCreator";
import ViewDocument from "./pages/ViewDocument";
import ComprehensiveWillCreator from "./pages/ComprehensiveWillCreator";
import EnhancedWillCreator from "./pages/EnhancedWillCreator";
import EnhancedPOAPropertyCreator from "./pages/EnhancedPOAPropertyCreator";
import EnhancedPOAPersonalCareCreator from "./pages/EnhancedPOAPersonalCareCreator";
import RevampedWillCreator from "./pages/RevampedWillCreator";
import WillCreatorPro from "./pages/WillCreatorPro";
import POAPropertyCreator from "./pages/POAPropertyCreator";
import POAPersonalCareCreator from "./pages/POAPersonalCareCreator";
import Onboarding from "./pages/Onboarding";
import { DocumentDetails } from "./pages/DocumentDetails";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/about" component={About} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/create-document" component={DocumentCreator} />
       <Route path={"/document-creator"} component={DocumentCreator} />
      <Route path={"/enhanced-will-creator"} component={EnhancedWillCreator} />
      <Route path={"/poa-property-creator"} component={EnhancedPOAPropertyCreator} />
      <Route path={"/poa-personal-care-creator"} component={EnhancedPOAPersonalCareCreator} />
      <Route path={"/revamped-will-creator"} component={RevampedWillCreator} />
      <Route path={"/view-document/:id"} component={ViewDocument} />
      <Route path={"/will-creator-pro"} component={WillCreatorPro} />
      <Route path={"/:404"} component={NotFound} />
      <Route path={"/poa-property-creator-pro"} component={POAPropertyCreator} />
      <Route path={"/poa-personal-care-creator-pro"} component={POAPersonalCareCreator} />
      <Route path={"/:404"} component={NotFound} />
      <Route path={"/documents/:id"} component={DocumentDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
