@php
    $metaPixelId = config('services.meta.pixel_id');
    $metaPageViewId = request()->attributes->get('meta_event_id');
    $metaLeadId = session('meta_lead_event_id');
@endphp
@if ($metaPixelId && $metaPageViewId)
    <script>
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', @json($metaPixelId));
        fbq('track', 'PageView', {}, {eventID: @json($metaPageViewId)});
        @foreach (request()->attributes->get('meta_browser_events', []) as $metaEvent)
            fbq('track', @json($metaEvent['name']), @json($metaEvent['data']), {eventID: @json($metaEvent['id'])});
        @endforeach
        @if ($metaLeadId)
            fbq('track', 'Lead', {}, {eventID: @json($metaLeadId)});
        @endif
    </script>
    <noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id={{ $metaPixelId }}&ev=PageView&noscript=1"></noscript>
@endif
