export default function Footer() {
  return (
    <footer className="border-top footer text-muted">
      <div className="container">&copy; {new Date().getFullYear()}</div>
    </footer>
  );
}
