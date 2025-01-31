import { useState } from "react";
import "./App.css";

function App() {
  const [payload, setPayload] = useState("");
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [vapidKey, setVapidKey] = useState({ publicKey: "", privateKey: "" });
  const [subscription, setSubscription] = useState({
    endpoint: "",
    p256dh: "",
    auth: "",
  });
  const [show, setShow] = useState({
    vapid: true,
    subscription: false,
    notification: false,
  });

  const onChange = (e) => {
    setVapidKey({ ...vapidKey, [e.target.name]: e.target.value });
    setError(false);
  };

  const subscriptionOnChange = (e) => {
    setSubscription({ ...subscription, [e.target.name]: e.target.value });
    setError(false);
  };

  const sendVapid = async () => {
    if (
      vapidKey.publicKey.trim().length !== 0 &&
      vapidKey.privateKey.trim().length !== 0
    ) {
      setMessage("");
      setLoading(true);
      const response = await fetch(
        "https://webpush-server-gfel.onrender.com/send-vapid",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(vapidKey),
        }
      );
      if (response.status == 200) {
        const jsonData = await response.json();
        setShow({ ...show, vapid: false, subscription: true });
        if (jsonData) {
          setVapidKey({ publicKey: "", privateKey: "" });
          setMessage(jsonData.message);
          setLoading(() => false);
        }
        setTimeout(() => {
          setMessage("");
        }, 3000);
      } else {
        setLoading(false);
        setMessage("Try Again With Correct Vapid Pair");
      }
    } else {
      setError(true);
    }
  };
  const sendSubscription = async () => {
    if (
      subscription.endpoint.trim().length !== 0 &&
      subscription.p256dh.trim().length !== 0 &&
      subscription.auth.trim().length !== 0
    ) {
      console.log(subscription);
      setMessage("");
      setLoading(true);
      const response = await fetch(
        "https://webpush-server-gfel.onrender.com/send-subcribe",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(subscription),
        }
      );
      if (response.status == 200) {
        setShow({ ...show, subscription: false, notification: true });
        const jsonData = await response.json();
        if (jsonData) {
          setSubscription({
            endpoint: "",
            p256dh: "",
            auth: "",
          });
          setMessage(jsonData.message);
          setLoading(() => false);
        }
        setTimeout(() => {
          setMessage("");
        }, 3000);
      } else {
        setLoading(false);
        setMessage("Please Try Again With Correct Subscription");
      }
    } else {
      setError(true);
    }
  };

  const sendNotifiation = async () => {
    if (payload && Object.keys(payload).length > 0 && !error) {
      setMessage("");
      setLoading(true);
      const response = await fetch(
        "https://webpush-server-gfel.onrender.com/send-notification",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            payload: JSON.stringify(JSON.parse(payload)),
          }),
        }
      );
      if (response.status === 200) {
        const jsonData = await response.json();
        if (jsonData) {
          setPayload("");
          setMessage(jsonData.message);
          setLoading(false);
        }
        setTimeout(() => {
          setMessage("");
        }, 3000);
      } else {
        setPayload("");
        setLoading(false);
        setMessage("Invalid JSON. Make Sure Provide Data in JSON Format");
      }
    } else {
      setError(true);
    }
  };

  return (
    <div className="container">
      <h1>Web Notification Server Frontend</h1>
      <h3>Here You can Send Notification to All Subcribers</h3>
      <p>{message}</p>
      {show.vapid && (
        <div className="form-container">
          <label htmlFor="publicKey">Vapid Public Key</label>
          <input
            type="text"
            id="publicKey"
            name="publicKey"
            style={{
              border: "1px solid gray",
              borderColor: error ? "red" : "grey",
              borderWidth: "1px",
            }}
            value={vapidKey.publicKey}
            onChange={onChange}
          />
          <label htmlFor="privateKey">Vapid Private Key</label>
          <input
            type="text"
            id="privateKey"
            name="privateKey"
            style={{
              border: "1px solid gray",
              borderColor: error ? "red" : "grey",
              borderWidth: "1px",
            }}
            value={vapidKey.privateKey}
            onChange={onChange}
          />
          <button onClick={sendVapid}>
            {loading ? "Sending" : "Send VapidKey"}
          </button>
        </div>
      )}
      {show.subscription && (
        <div className="form-container">
          <label htmlFor="endpoint">Subscription EndPoint</label>
          <input
            type="text"
            id="endpoint"
            style={{
              border: "1px solid gray",
              borderColor: error ? "red" : "grey",
              borderWidth: "1px",
            }}
            name="endpoint"
            value={subscription.endpoint}
            onChange={subscriptionOnChange}
          />
          <label htmlFor="p256dh">Subscription p256dh</label>
          <input
            type="text"
            id="p256dh"
            style={{
              border: "1px solid gray",
              borderColor: error ? "red" : "grey",
              borderWidth: "1px",
            }}
            name="p256dh"
            value={subscription.p256dh}
            onChange={subscriptionOnChange}
          />
          <label htmlFor="auth">Subscription Auth</label>
          <input
            type="text"
            id="auth"
            style={{
              border: "1px solid gray",
              borderColor: error ? "red" : "grey",
              borderWidth: "1px",
            }}
            name="auth"
            value={subscription.auth}
            onChange={subscriptionOnChange}
          />
          <button onClick={sendSubscription}>
            {loading ? "Sending" : "Send Subscription"}
          </button>
        </div>
      )}
      {show.notification && (
        <div className="form-container">
          <label htmlFor="payload">Notification Payload : Format JSON</label>
          <textarea
            id="payload"
            name="payload"
            rows="5"
            cols="40"
            style={{
              border: "1px solid gray",
              borderColor: error ? "red" : "grey",
              borderWidth: "1px",
              outline: "none",
              height: "160px",
              resize: "none",
            }}
            value={payload}
            placeholder='{"title": "Hello", "body": "Welcome!"}'
            onChange={(e) => {
              setPayload(e.target.value);
              try {
                JSON.parse(e.target.value);
                setMessage("");
                setError(false);
              } catch {
                setError(true);
                setMessage("Invalid JSON");
              }
            }}
          ></textarea>

          <button disabled={loading || error} onClick={sendNotifiation}>
            {loading ? "Sending" : "Send Notification"}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
