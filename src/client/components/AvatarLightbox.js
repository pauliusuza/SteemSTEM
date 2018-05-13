import React from 'react';
import PropTypes from 'prop-types';
import Avatar from './Avatar';

export default class AvatarLightbox extends React.Component {
  static propTypes = {
    username: PropTypes.string,
    size: PropTypes.number,
  };

  static defaultProps = {
    username: undefined,
    size: 100,
  };

  state = {};

  render() {
    const { username, size } = this.props;

    return (
      <div>
        <a role="presentation">
          <Avatar username={username} size={size} />
        </a>
      </div>
    );
  }
}
