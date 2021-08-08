// React = Object-oriented HTML (markup) + declarative JavaScript (logic)

function Logo() {
    return (
        <img src="favicon-32x32.png" width="32" height="32" alt="Hacker News logo"></img>
    );
}

function NavLink(props) {
    return (
        <a id={props.id} href="javascript:void(0);">{props.value}</a>
    );
}

function Nav(props) {
    return (
        <nav>
            <Logo />
            <NavLink id="topstories" value="Hacker News" /> -
            <NavLink id="newstories" value="New" /> -
            <NavLink id="beststories" value="Best" /> -
            <NavLink id="askstories" value="Ask" /> -
            <NavLink id="showstories" value="Show" /> -
            <NavLink id="jobstories" value="Job" />
        </nav>
    )
}

function App() {
    return (
        <div>
            <Nav />
            <p>I am React app (I'm the same as the regular JS but managable).</p>
        </div>
    );
}

// Put App component inside DOM body
ReactDOM.render(<App />, document.body);