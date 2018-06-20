import React from 'react';
import PropTypes from 'prop-types';
import Avatar from './Avatar';

export default class AvatarLightbox extends React.Component {
  static propTypes = {
    username: PropTypes.string,
    size: PropTypes.number,
    isActive: PropTypes.bool,
  };

  static defaultProps = {
    username: undefined,
    size: 100,
    isActive: false,
  };

  state = {};

  render() {
    const { username, size, isActive } = this.props;

    return (
      <div>
        <a role="presentation">
          <Avatar username={username} size={size} />
          {isActive && <div className="UserHeader__container--active" />}
        </a>
      </div>
    );
  }
}
