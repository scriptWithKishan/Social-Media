import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";

import RegisterLogin from "./components/RegisterLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./components/Home";
import Profile from "./components/Profile";
import NotFound from "./components/NotFound";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/login-register" component={RegisterLogin} />
        <ProtectedRoute exact path="/" component={Home} />
        <ProtectedRoute exact path="/profile" component={Profile} />
        <Route path="/not-found" component={NotFound} />
        <Redirect to="not-found" />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
