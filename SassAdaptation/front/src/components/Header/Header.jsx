import './Header.scss';

const Header = () => (
    <header>
        <div className="logo-title">
            <span className="logo">Logo</span>
            <h1>Montagne</h1>
        </div>
        <nav>
            <ul>
                <li><a href="/">Accueil</a></li>
                <li><a href="/about">À propos</a></li>
            </ul>
        </nav>
    </header>
);

export default Header;
