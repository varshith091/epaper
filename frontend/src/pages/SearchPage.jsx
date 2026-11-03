import { useState } from "react";

function SearchPage() {

    const [keyword, setKeyword] = useState("");
    const [articles, setArticles] = useState([]);

    const searchArticles = async () => {

        const response = await fetch(
            `http://localhost:8080/api/articles/search/keyword?keyword=${keyword}`
        );

        const data = await response.json();

        setArticles(data);
    };

    return (
        <div>

            <input
                type="text"
                placeholder="Search news..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
            />

            <button onClick={searchArticles}>
                Search
            </button>

            {articles.map((article) => (

                <div key={article.id}>

                    <h2>{article.headline}</h2>

                    <p>{article.content}</p>

                </div>
            ))}

        </div>
    );
}

export default SearchPage;