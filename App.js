import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Image,
  Animated 
} from 'react-native';

export default class App extends Component<{}> {
  state = {
    data: [],
    page: 1,
    loading: false,
    opacity: new Animated.Value(0),
  };
  
  componentDidMount() {
    this.loadRepositories();
  }

  onLoad = event => {
    Animated.timing(this.state.opacity, {
      toValue: 1,
      duration: 300,
    }).start();
  }

  loadRepositories = async () => {
    if (this.state.loading) return;

    const { page } = this.state;
    
    const baseURL = 'https://api.github.com';
    const searchTerm = 'react';
    const perPage = 20;

    this.setState({ loading: true });

    const response = await fetch(`${baseURL}/search/repositories?q=${searchTerm}&per_page=${perPage}&page=${page}`);
    let repositories = await response.json();

    repositories.items = repositories.items.map((elem) => {
      let _ = {
        loaded: false
      }
      elem = Object.assign(_, elem);
      return elem;
    });

    this.setState({
      data: [ ...this.state.data, ...repositories.items ],
      page: page + 1,
      loading: false,
    });
  }
  
  handleLazyLoad = ({ viewableItems }) => {
    const newData = this.state.data.map(image =>
      viewableItems.find(({ item }) => item.id === image.id)
        ? { ...image, loaded: true }
        : image
    );

    this.setState({ data: newData });
  }

  renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={{ marginVertical: 20, height: 300, backgroundColor: 'red' }}>
      { item.loaded && <Image
        source={{ uri: item.owner.avatar_url }}
        style={{ width: '100%', height: 300 }}
      /> }
    </View>
      <Text>{item.full_name} {item.loaded}</Text>
    </View>
  );
  
  renderFooter = () => {
    if (!this.state.loading) return null;
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  };

  render() {
    return (
      <FlatList
        style={{ marginTop: 30 }}
        contentContainerStyle={styles.list}
        data={this.state.data}
        renderItem={this.renderItem}
        keyExtractor={item => item.id}
        onEndReached={this.loadRepositories}
        onEndReachedThreshold={0.3}
        ListFooterComponent={this.renderFooter}
        onViewableItemsChanged={this.handleLazyLoad}
      />
    );
  }

}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
  },
  loading: {
    marginTop: 20,
    marginBottom: 20,
  },
  listItem: {
    backgroundColor: '#EEE',
    marginTop: 20,
    padding: 30,
  },
});
