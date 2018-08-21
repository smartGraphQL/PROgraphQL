const graphql = require('graphql');
const Song = require('../model/songModel');
const Artist = require('../model/artistModel');

const {
  GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLInt, GraphQLList,
} = graphql;

const SongType = new GraphQLObjectType({
  name: 'Song',
  fields: () => ({
    artistId: { type: GraphQLString },
    name: { type: GraphQLString },
    artist: {
      type: ArtistType,
      complexity: { type: GraphQLInt, default: 5 },
      resolve(parents, args) {
        return Artist.findById(parents.artistId);
      },
    },
  }),
});

const ArtistType = new GraphQLObjectType({
  name: 'Artist',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    complexity: { type: GraphQLInt, default: 5 },
    songs: {
      type: new GraphQLList(SongType),
      args: { first: { type: GraphQLInt } },
      resolve(parents, args) {
        return Song.find({ artistId: parents.id }).limit(args.first);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    song: {
      type: SongType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return Song.findById(args.id);
      },
    },
    artist: {
      type: ArtistType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return Artist.findById(args.id);
      },
    },
    songs: {
      type: new GraphQLList(SongType),
      args: { first: { type: GraphQLInt } },
      resolve(parents, args) {
        return Song.find({}).limit(args.first);
      },
    },
    artists: {
      type: new GraphQLList(ArtistType),
      args: { first: { type: GraphQLInt } },
      resolve(parents, args) {
        return Artist.find({}).limit(args.first);
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addArtist: {
      type: ArtistType,
      args: {
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
      },
      resolve(parents, args) {
        const artist = new Artist({
          name: args.name,
          age: args.age,
        });
        return artist.save();
      },
    },
    addSong: {
      type: SongType,
      args: {
        name: { type: GraphQLString },
        artistId: { type: GraphQLString },
      },
      resolve(parents, args) {
        const song = new Song({
          name: args.name,
          artistId: args.artistId,
        });
        return song.save();
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
