export default function AppLoading() {
  return (
    <div className="app-loader-shell" aria-live="polite" aria-busy="true">
      <div className="app-loader-wrap">
        <div className="app-loader-ring" aria-hidden="true">
          <div className="app-loader-core" />
        </div>

        <div>
          <div className="app-loader-label">Loading</div>
          <div className="app-loader-subtext">Finding the best deals for you</div>
        </div>
      </div>
    </div>
  )
}
