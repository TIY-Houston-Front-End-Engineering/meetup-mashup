"use strict";

require("babel/register")
require("es5-shim")

import {Promise} from 'es6-promise'
import Backbone from 'backbone'
import React, {Component} from 'react'
import _ from 'underscore'


const qs = (s, el) => (el || document).querySelector(s)

const meetup_key = `326e493f58383976434f5963243a5e`,
    meetup_url = (path) => `https://api.meetup.com${path}?key=${meetup_key}&callback=?`,
    find_groups_url = (search) => `${meetup_url('/find/groups')}&text=${search}`,
    find_events_url = () => meetup_url('/2/open_events')


var Groups = Backbone.Collection.extend({
    url: function(){
        return find_groups_url(this.search)
    },
    parse: (json) => json.data
})

//             Backbone.Collection ----> Backbone.Collection.protoype
//                   |
//                   |
//                   |
// groups ---> Groups.prototype
//
// groups.url() ---> `this` would be groups

/** SINGLETONS */
const groups = new Groups()
/** end */

// const typeahead = (cb, timeout, context) => _.debounce(() => {
//     // is fetching already occuring?
//     if(context.fetching){
//         // assume context.fetching is a $.Deferred
//         context.fetching.abort()
//     }

//     context.fetching = cb() // cb returns a $.Deferred()
//     context.fetching.then((...args) => {
//         context.fetching = null
//     })
// }, timeout)

function* search(){
    var promise
    while(true){
        if(promise) promise.abort()
        promise = groups.fetch()
        promise.then(() => {
            promise = null
        })
        yield promise
    }
}


class Search extends Component {
    constructor(...args){
        super(...args)
        this.state = {
            search: search()
        }
    }
    _search(){
        var searchText = React.findDOMNode(this.refs.search).value
        groups.search = searchText
        this.state.search.next()
    }
    render(){
        return (<form>
            <div>
                <input type="search" ref="search"
                placeholder="Search for meetups"
                onKeyUp={() => this._search()} />
            </div>
            <button>Go!</button>
        </form>)
    }
}

class Grid extends Component {
    constructor(...args){
        super(...args)
        this.sync = () => this.forceUpdate()
    }
    componentDidMount(){
        groups.on('sync', this.sync)
    }
    componentDidUnmount(){
        groups.off('sync', this.sync)
    }
    render(){
        return (<div>
            {groups.map((model) => <MeetupGroup model={model} />)}
        </div>)
    }
}

String.prototype.truncate = function(chars){
    return this.substr(0,chars)+'...'
}

class MeetupGroup extends Component {
    constructor(...args){
        super(...args)
    }
    render(){
        var json = this.props.model.toJSON()
        return (<div>
            <a href={json.link} target="_blank">
                <h3>{json.name}</h3>
            </a>
            <hr />
            <div className="description" dangerouslySetInnerHTML={{__html: json.description }}></div>
        </div>)
    }
}

class Meetup extends Component {
    constructor(...args){
        super(...args)
    }
    render(){
        return (<div>
            <Search />
            <Grid />
        </div>)
    }
}

React.render(<Meetup />, qs('.container'))















