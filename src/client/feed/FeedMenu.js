import React, {Component} from 'react';
import { withRouter, Link } from 'react-router-dom';
import './FeedMenu.less';

@withRouter
class FeedMenu extends Component {
  render() {
    return (
      <div className="FeedMenu">
        <Link to={`${this.props.sortBy}`}>
          All Articles
        </Link>
        <Link to={`${this.props.sortBy}/steemstem-curated`}>
          Curated
        </Link>
        <Link to={`${this.props.sortBy}/steemstem-featured`}>
          Featured
        </Link>
      </div>
    );
  }
}

export default FeedMenu;
