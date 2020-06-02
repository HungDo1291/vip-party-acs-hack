import React, { useEffect, useRef, useState } from "react"
import TwilioVideo from "twilio-video"

import Layout from "../components/layout"
import SEO from "../components/seo"
import StartForm from "../components/start-form"

const Video = ({ token }) => {
  const localVidRef = useRef()
  const remoteVidRef = useRef()

  useEffect(() => {
    TwilioVideo.connect(token, { video: true, audio: true, name: "test" }).then(
      room => {
        // Attach the local video
        console.log(token)
        var jwt = require('jsonwebtoken');
        var decoded = jwt.decode(token);
        var identity = decoded.grants.identity;
        console.log(identity);
        console.log("local name: ", identity)
        console.log("identity.includes('secondary_guest') = ", identity.includes('secondary_guest'))
        if (!identity.includes('secondary_guest')){
            TwilioVideo.createLocalVideoTrack().then(track => {
              localVidRef.current.appendChild(track.attach())
            })
        }

        const addParticipant = participant => {
          console.log("new remote participant!")
          console.log("remote name: ", participant.identity)
          console.log("participant.identity.includes('secondary_guest') = ", participant.identity.includes('secondary_guest'))
          if (participant.identity.includes('secondary_guest')){console.log("shouldn't show video")}
          if (!participant.identity.includes('secondary_guest')){console.log("this is not a secondary guest")
              participant.tracks.forEach(publication => {
                if (publication.isSubscribed) {
                  const track = publication.track

                  remoteVidRef.current.appendChild(track.attach())
                  console.log("attached to remote video")
                }
              })

              participant.on("trackSubscribed", track => {
                console.log("track subscribed")
                remoteVidRef.current.appendChild(track.attach())
              })
            }
        }

        room.participants.forEach(addParticipant)
        room.on("participantConnected", addParticipant)
      }
    )
  }, [token])

  return (
    <div>
      <p>Local video: </p><div ref={localVidRef} />
      <p>Remote video: </p><div ref={remoteVidRef} />
    </div>
  )
}

const IndexPage = () => {
  const [token, setToken] = useState(false)
  return (
    <Layout>
      <p>
        The Display Name is currently hard-coded with prefixes:<br />
        1> A Host should be named 'host_[name]'.<br />
        2> A Primary guest can take any names, I recommend writing 'primary_guest_[name]'.<br />
        3> A Secondary guest should be named 'secondary_guest_[name]'.<br />

      </p>
      <SEO title="Home" />
      {!token ? <StartForm storeToken={setToken} /> : <Video token={token} />}

    </Layout>
  )
}

export default IndexPage
