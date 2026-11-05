export default function Contact() {
  return (
    <div className="controls">
      <div className="row">
        <div className="col-md-6">
          <div className="form-group" />
        </div>
        <div className="container">
          <div className="center">
            <form className="contact-form" style={{ width: '400px' }}>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input id="firstName" className="form-control" type="text" name="firstName" placeholder="Jane" />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input id="lastName" className="form-control" type="text" name="lastName" placeholder="Doe" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" className="form-control" type="email" name="email" placeholder="janedoe@gmail.com" />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" className="form-control" rows={3} name="message" placeholder="Write something here..." />
              </div>
              <button className="d-inline-block btn btn-primary" type="submit">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
