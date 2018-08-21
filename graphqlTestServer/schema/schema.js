const graphql = require('graphql');
const Song = require('../model/songModel');
const Artist = require('../model/artistModel');

let artistCounter = 0;
let songCounter = 0; 

const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLSchema,
	GraphQLInt,
	GraphQLList,
	GraphQLID
} = graphql;

const SongType = new GraphQLObjectType({
	name: 'Song',
	fields: () => ({
		artistId: { type: GraphQLString},
		name: { type: GraphQLString},
		artist: {
			type: ArtistType,
			complexity:{type:GraphQLInt, default:5},
			resolve(parents, args){
				//console.log("SONG", parents);
				//return _.find(artists, {id: parents.artistId})
				return Artist.findById(parents.artistId, (data) => {
					//console.log("DATA", data)
				});
			}
		}
	})
})

const ArtistType = new GraphQLObjectType({
	name: 'Artist',
	fields: () => ({
		id: { type: GraphQLString},
		name: { type: GraphQLString},
		age: { type: GraphQLInt},
		complexity:{type:GraphQLInt, default:5},
		songs: {
			type: new GraphQLList(SongType),
			args: { first: { type: GraphQLInt}},
			resolve(parents, args){
				//console.log("Songs resolve function called")
				//return _.filter(songs, {artistId: parents.id})
				return Song.find({artistId: parents.id}).limit(args.first);
			}

		}
	})
})

const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		song: {
			type: SongType,
			args: { id: { type: GraphQLString}},
			resolve(parent, args){
				//console.log("song11", parents);
				//get data from db
				//return _.find(songs, {id: args.id})
				return Song.findById(args.id);
			}
		},
		artist: {
			type: ArtistType,
			args: { id: { type: GraphQLString}},
			resolve(parent, args){
				//console.log("song22", parents);
				//get data from db
				artistCounter++;
				console.log("AC", artistCounter);
				return Artist.findById(args.id);
			}
		},
		songs: {
			type: new GraphQLList(SongType),
			args: { first: { type: GraphQLInt}},
			resolve(parents, args){
				songCounter++
				console.log("SC", songCounter);
				return Song.find({}).limit(args.first);
			}
		},
		artists: {
			type: new GraphQLList(ArtistType),
			args: { first: { type: GraphQLInt}},
			resolve(parents, args){
				artistCounter++;
				console.log("AC", artistCounter);
				return Artist.find({}).limit(args.first);
			}
		}
	}
})

const Mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		addArtist: {
			type: ArtistType,
			args: {
				name: {type: GraphQLString},
				age: {type: GraphQLInt}
			},
			resolve(parents, args){
				let artist = new Artist({
					name: args.name,
					age: args.age
				})
				return artist.save();
			}
		},
		addSong: {
			type: SongType,
			args: {
				name: {type: GraphQLString},
				artistId: {type: GraphQLString}
			},
			resolve(parents, args){
				let song = new Song({
					name: args.name,
					artistId: args.artistId
				})
				return song.save();
			}
		}
	}
})

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation: Mutation
})
