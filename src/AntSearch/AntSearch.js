import React from 'react';
import { Input } from 'antd';
import { debounce } from 'lodash';
import './AntSearch.css';

import MovieApiService from '../MovieApiService';

export default class AntSearch extends React.Component {
  movieService = new MovieApiService();

  onInputHandler = (e) => {
    if (e.target.value.trim().length === 0) return;
    this.props.onInput(e.target.value);
  }

  render() {
    return (
      <Input placeholder="Type to search..." onKeyUp={debounce(this.onInputHandler, 500)}/>
    )
  }
}