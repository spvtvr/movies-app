import React from "react";
import "./MovieItem.css";
import MovieApiService from "../MovieApiService";
import AntSpinner from "../AntSpinner";
import AntError from "../AntError";
import AntSearch from "../AntSearch";
import { Pagination, Alert, Rate, Tabs } from "antd";
import { format } from "date-fns";
import { Consumer } from "../context";

export default class MovieItem extends React.Component {
  movieService = new MovieApiService();
  state = {
    movies: null,
    ratedMovies: [],
    loading: true,
    error: false,
    query: "return",
    total: null,
    page: null,
    genres: null,
    // guestID: null,
  };

  componentDidMount() {
    // this.movieService
    //   .createGuestSession()
    //   .then((res) => {
    //     return this.setState({
    //       guestID: res.guest_session_id,
    //     });
    //   })
    //   .catch(this.onError);

    // const localData = JSON.parse(localStorage.getItem('Rated Movies'))
    // if (localData === null || localData === []) {
    //   return
    // }

    return this.movieService
      .getMoviesArr()
      .then((data) => {
        return this.setState({
          movies: data.results,
          loading: false,
          total: data.total_results,
          page: data.page,
        });
      })
      .catch(this.onError);
  }

  onError = () => {
    return this.setState({
      loading: false,
      error: true,
    });
  };

  componentDidUpdate(prevProps, prevState) {
    const { query, page, ratedMovies } = this.state;
    if (prevState.query !== query) {
      this.movieService.getMoviesSearch(query).then((data) => {
        this.setState({
          movies: data.results,
          total: data.total_results,
        });
      });
    }
    if (prevState.page !== page) {
      this.movieService.getMoviesPage(query, page).then((data) => {
        this.setState({
          movies: data.results,
          page,
        });
      });
    }
    if (prevState.ratedMovies !== ratedMovies) {
      localStorage.setItem("Rated Movies", JSON.stringify(ratedMovies));
      this.setState({
        ratedMovies: ratedMovies,
      });
    }
  }

  shortOverview(overview, maxSymbols, postfix) {
    const pos = overview.indexOf(" ", maxSymbols);
    return pos === -1 ? overview : overview.substring(0, pos) + postfix;
  }

  countAverage(num) {
    if (num > 0 && num <= 3) {
      return <div className="vote-average-1">{num}</div>;
    }
    if (num > 3 && num <= 5) {
      return <div className="vote-average-2">{num}</div>;
    }
    if (num > 5 && num <= 7) {
      return <div className="vote-average-3">{num}</div>;
    }
    if (num > 7) {
      return <div className="vote-average-4">{num}</div>;
    }
  }

  // onChangeRate(rateNum, movieID) {
  //   const { guestID } = this.state;
  //   const bodyRequest = {
  //     'value': rateNum,
  //   };
  //   this.movieService.handleMovieRating(guestID, bodyRequest, movieID)
  //   .catch(this.onError)
  // }

  onChangeRate(value, movie) {
    const { ratedMovies, movies } = this.state;
    const result = ratedMovies.find((elem) => elem.id === movie.id) || false;
    // Записать сюда функционал if (value) > 0
    if (result) {
      return this.setState({
        movies: movies.map((elem) => {
          if (elem.id === movie.id) {
            return { ...elem, rating: value };
          }
          return elem;
        }),
        ratedMovies: ratedMovies.filter((elem) => elem.id !== movie.id),
      });
    }
    return this.setState({
      movies: movies.map((elem) => {
        if (elem.id === movie.id) {
          return { ...elem, rating: value };
        }
        return elem;
      }),
      ratedMovies: [...ratedMovies, { ...movie, rating: value }],
    });
  }

  createMovieItem(movie) {
    const release = movie.release_date
      ? format(new Date(movie.release_date), "MMMM dd, yyyy")
      : "Дата релиза неизвестна";
    const poster =
      movie.poster_path === null
        ? "http://big-wave.co.uk/wp-content/uploads/2015/10/no_image1-900x1200.jpg"
        : `https://image.tmdb.org/t/p/original${movie.poster_path}`;
    return (
      <li className="movie-item" key={movie.id}>
        <img className="movie-img" src={poster} alt="Poster" />
        <div className="movie-text">
          {this.countAverage(movie.vote_average)}
          <h2 className="movie-title">{movie.title}</h2>
          <span className="movie-date">{release}</span>
          <div className="movie-genres">
            <Consumer>
              {(genres) => {
                const genresIdsLabels = [];
                movie.genre_ids.forEach((elem) => {
                  for (let i = 0; i < genres.length; i++) {
                    if (genres[i].id === elem) {
                      genresIdsLabels.push(genres[i].name);
                    }
                  }
                });
                const res = genresIdsLabels.map(elem => {
                  return (
                    <span key={elem} className="movie-genres-item">{elem}</span>
                  )
                })
                return (
                  <div className="movie-genres">
                    { [...res] }
                  </div>
                );
              }}
            </Consumer>
          </div>
          <p className="movie-description">
            {this.shortOverview(movie.overview, 90, "...")}
          </p>
          <Rate
            value={movie.rating}
            style={{ fontSize: 15 }}
            count={10}
            onChange={(v) => this.onChangeRate(v, movie)}
          />
        </div>
      </li>
    );
  }

  onInputChange(value) {
    this.setState({
      query: value,
    });
  }

  onChangePage(value) {
    this.setState({
      page: value,
    });
  }

  render() {
    const { movies, loading, error, total } = this.state;

    const spinItem = loading ? <AntSpinner /> : null;
    const errorItem = error ? <AntError /> : null;
    const hasData = !(loading || error);
    const movieItems = hasData
      ? movies.map((item) => this.createMovieItem(item))
      : null;
    const notFound =
      total === 0 ? (
        <Alert type="info" description="По вашему запросу ничего не найдено" />
      ) : null;
    const { TabPane } = Tabs;

    const rateData = JSON.parse(localStorage.getItem("Rated Movies"));
    const hasRateMovies =
      rateData === null || rateData.length === 0 ? (
        <Alert type="info" description="Список пуст" />
      ) : (
        rateData.map((item) => this.createMovieItem(item))
      );
    return (
      <>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Search" key="1">
            <AntSearch onInput={(value) => this.onInputChange(value)} />
            <ul className="movies-list">
              {spinItem}
              {errorItem}
              {movieItems}
              {notFound}
            </ul>
            <Pagination
              onChange={(e) => this.onChangePage(e)}
              defaultCurrent={1}
              defaultPageSize={20}
              showSizeChanger={false}
              total={total}
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "30px 0px",
              }}
            />
          </TabPane>
          <TabPane tab="Rated" key="2">
            <ul className="movies-list">{hasRateMovies}</ul>
          </TabPane>
        </Tabs>
      </>
    );
  }
}
