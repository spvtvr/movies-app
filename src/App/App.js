import React from "react";
import { Online, Offline } from "react-detect-offline";
import { Alert } from "antd";
import "antd/dist/antd.min.css";
import "./App.css";

import MovieItem from "../MovieItem";
import { Provider } from "../context";

export default class App extends React.Component {
  state = {
    genres: [],
  };

  componentDidMount() {
    return fetch(
      "https://api.themoviedb.org/3/genre/movie/list?api_key=fe376611c70e9694e174f7ee3afdb680&language=en-US"
    )
      .then((res) => res.json())
      .then((data) => {
        return this.setState({
          genres: data.genres,
        });
      });
  }

  render() {
    return (
      <>
        <Provider value={this.state.genres}>
          <Online>
            <MovieItem />
          </Online>
          <Offline>
            <Alert
              type="warning"
              description="Вы оффлайн. Проверьте интернет-соединение."
            />
          </Offline>
        </Provider>
      </>
    );
  }
}
